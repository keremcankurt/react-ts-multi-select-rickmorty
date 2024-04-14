import React, { useEffect, useRef, useState } from "react";
import styles from "./MultiSelect.module.css";

interface Option {
  id: string;
  label: string;
  image: string;
  desc: string;
}

interface MultiSelectProps {
  fetchData?: () => void;
  value: Option[];
  options: Option[];
  setValue: React.Dispatch<React.SetStateAction<Option[]>>;
  loading?: boolean;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}

export function MultiSelect({
  fetchData = () => {},
  value,
  options,
  setValue,
  loading = false,
  searchText,
  setSearchText,
  placeholder = "search",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  function selectOption(option: Option) {
    if (value.some((val) => val.id === option.id)) {
      setValue(value.filter((val) => val.id !== option.id));
    } else {
      setValue([...value, option]);
    }
  }

  function isOptionSelected(option: Option) {
    return value.some((val) => val.id === option.id);
  }

  useEffect(() => {
    if (isOpen) {
      fetchData && fetchData();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Enter":
          setIsOpen((prev) => !prev);
          break;
        case "ArrowUp":
        case "ArrowDown": {
          if (!isOpen) {
            setIsOpen(true);
            break;
          }

          const newValue = highlightedIndex + (e.code === "ArrowDown" ? 1 : -1);
          if (newValue >= 0 && newValue < options.length) {
            setHighlightedIndex(newValue);
          }
          break;
        }
        case "Tab":
          e.preventDefault();
          if (isOpen) selectOption(options[highlightedIndex]);
          break;
      }
    };
    containerRef.current?.addEventListener("keydown", handler);

    return () => {
      containerRef.current?.removeEventListener("keydown", handler);
    };
  }, [isOpen, highlightedIndex, options]);

  function highlightText(option: Option) {
    const regex = new RegExp(`(${searchText})`, "gi");
    const highlightedText = option.label.replace(regex, "<strong>$1</strong>");

    return <p dangerouslySetInnerHTML={{ __html: highlightedText }}></p>;
  }

  return (
    <div ref={containerRef} tabIndex={0} className={styles.container}>
      <span className={styles.value}>
        {value.map((v) => (
          <button
            key={v.id}
            onClick={(e) => {
              e.stopPropagation();
              selectOption(v);
            }}
            className={styles["option-badge"]}
          >
            {v.label}
            <span className={styles["remove-btn"]}>&times;</span>
          </button>
        ))}

        <input
          placeholder={placeholder}
          className={styles["search-input"]}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onClick={() => setIsOpen(false)}
        />
      </span>

      <div
        className={styles.caret}
        onClick={(e) => {
          setIsOpen(!isOpen);
        }}
      ></div>
      <ul className={`${styles.options} ${isOpen ? styles.show : ""}`}>
        {loading ? (
          <li className={styles["loading-indicator"]}>
            <div className={styles["spinner"]}></div>
          </li>
        ) : options.length > 0 ? (
          options.map((option, index) => (
            <li key={option.id}>
              <input
                type="checkbox"
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`${styles.option} ${
                  isOptionSelected(option) ? styles.selected : ""
                } ${index === highlightedIndex ? styles.highlighted : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(option);
                }}
                checked={isOptionSelected(option)}
              />
              <img src={option.image} alt={option.label} />
              <div>
                <p>{highlightText(option)}</p>
                <p className={styles["desc"]}>{option.desc}</p>
              </div>
            </li>
          ))
        ) : (
          <li className={styles["not-found"]}>Not found</li>
        )}
      </ul>
    </div>
  );
}
