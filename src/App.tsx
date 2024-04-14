import React, { useState } from "react";
import { MultiSelect } from "./components/MultiSelect";

interface Character {
  id: string;
  label: string;
  image: string;
  desc: string;
}

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character?name=${searchText}`);
      if (!response.ok) {
        setCharacters([]);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const simplifiedData: Character[] = data.results.map((character: any) => ({
        id: character.id,
        label: character.name,
        image: character.image,
        desc: `${character.episode.length} Episodes`
      }));
      setCharacters(simplifiedData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="App">
      <MultiSelect
        fetchData={fetchData}
        options={characters.map((character: Character) => ({
          id: character.id,
          label: character.label,
          image: character.image,
          desc: character.desc
        }))}
        value={selectedCharacters}
        setValue={setSelectedCharacters}
        loading={loading}
        searchText={searchText}
        setSearchText={setSearchText}
        placeholder="Rick"
      />
    </div>
  );
}

export default App;
