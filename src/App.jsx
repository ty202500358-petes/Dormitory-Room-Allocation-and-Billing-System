import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [pokemon, setPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon?limit=300")
      .then((response) => {
        const pokemonList = response.data.results.map((poke, index) => ({
          id: index + 1,
          name: poke.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
          url: poke.url,
        }));

        setPokemon(pokemonList);
      })
      .catch((error) => {
        console.error("Error fetching Pokémon:", error);
      });
  }, []);

  function handleChange(e) {
    setSearchInput(e.target.value);
  }

  function showStats(poke) {
    axios.get(poke.url).then((response) => {
      setSelectedPokemon(response.data);
    });
  }

  const filteredPokemon = pokemon.filter((poke) =>
    poke.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
      <div className="header">
        <h1>Pokemon</h1>
      </div>

      <div className="searchBar">
        <input
          type="text"
          value={searchInput}
          onChange={handleChange}
          placeholder="Type pokemon name..."
        />
      </div>

      <div className="pokemon-container">
        {filteredPokemon.map((poke) => (
          <div
            className="card"
            key={poke.id}
            onClick={() => showStats(poke)}
          >
            <p>{poke.name}</p>

            <img src={poke.image} alt={poke.name} />

            <p>#{poke.id}</p>
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <div className="modal" onClick={() => setSelectedPokemon(null)}>
          <div
            className="stats-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedPokemon(null)}
            >
              ×
            </button>

            <h2>{selectedPokemon.name}</h2>

            <img
              src={selectedPokemon.sprites.other["official-artwork"].front_default}
              alt={selectedPokemon.name}
            />

            <p>
              <strong>Pokédex ID:</strong> #{selectedPokemon.id}
            </p>

            <p>
              <strong>Height:</strong> {selectedPokemon.height}
            </p>

            <p>
              <strong>Weight:</strong> {selectedPokemon.weight}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {selectedPokemon.types
                .map((type) => type.type.name)
                .join(", ")}
            </p>

            <h3>Stats</h3>

            {selectedPokemon.stats.map((stat) => (
              <p key={stat.stat.name}>
                <strong>{stat.stat.name}:</strong> {stat.base_stat}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
