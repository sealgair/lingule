import logo from './logo.svg';
import './App.css';

function App() {
    return (
        <div className="Container">
            <header className="Header">Lingule</header>
            <div className="Body">
                <div className="WordContainer">
                    <div id="word">lingule</div>
                    <div id="ipa">ˈlɪŋ.ɡwəl</div>
                    <div id="meaning">a fun language game</div>
                </div>
                <Guesses/>
            </div>
        </div>
    );
}

function Guesses() {
    const numbers = [1, 2, 3, 4, 5, 6];
    const list = numbers.map((n) =>
        <li className="Guess" value={n}/>
    );
    return (
        <div className="Guesses">
            <ul>
                {list}
            </ul>
            <Lookup/>
        </div>
    );
}

function Lookup() {
    return (
        <input type="text" class="Guess Lookup" placeholder="Language..."/>
    )
}

export default App;
