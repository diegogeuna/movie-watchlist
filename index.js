const mainEl = document.getElementById("main");
const watchlistBtn = document.getElementById("watchlist-btn");
const searchForMoviesBtn = document.getElementById("search-for-movies-btn");

const inputContainer = document.getElementById("input-container");
const movieInput = document.getElementById("movie-input");
const searchInput = document.getElementById("search-input");

let watchlistData = [];
let watchlistHTML = ``;

let moviesSearchData = [];
let moviesSearchHTML = ``;


searchInput.addEventListener("click", function(){
    if (movieInput.value) {
        fetch(`http://www.omdbapi.com/?apikey=ef5e175b&type=movie&s=${movieInput.value}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === "False") {
                    renderMsgUnableToFind();
                    searchInput.value = ``;
                    throw new Error(data.Error);
                }
                return data;
            })
            .then(data => renderWatchlist(data.Search))
            .catch(error => console.error(error));
    }
})

function renderWatchlist(arr) {
    moviesSearchHTML = ``;

    const requests = arr.map((movie) => {
        return fetch(`http://www.omdbapi.com/?apikey=ef5e175b&i=${movie.imdbID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.Response === "False") {
                    throw new Error(data.Error);
                }
                return data;
            })
    });

    Promise.all(requests)
        .then(data => {
            moviesSearchData = data;
            moviesSearchHTML = data.map(movie => `
                <div class="movie-container">
                    <div class="movie-poster">
                        <img src="${movie.Poster === "N/A" ? "" : movie.Poster} alt="${movie.Title} poster"/>
                    </div>
                    <div class="movie-info">
                        <div>
                            <h2 class="movie-title">${movie.Title}</h2>
                            <p class="movie-rating"><i class="fa-solid fa-star"></i> ${movie.imdbRating === "N/A" ? "-" : movie.imdbRating}</p>
                        </div>
                        <div class="movie-details">
                            <p class="movie-runtime">${movie.Runtime}</p>
                            <p class="movie-genre">${movie.Genre}</p>
                            <button id="add-to-watchlist" class="add-to-watchlist" data-id="${movie.imdbID}"><i class="fa-solid fa-circle-plus"></i> watchlist</button>
                        </div>
                        <p class="movie-plot">${movie.Plot === "N/A" ? "There is not plot available at this time." : movie.Plot}</p>
                    </div>
                </div>`).join("");
            mainEl.innerHTML = moviesSearchHTML;
        })
        .catch(error => console.error(error));
}

function renderStartExploring(){
    movieInput.value = '';
    mainEl.innerHTML = `
    <div id="start-exploring">
        <i class="fa-solid fa-film"></i>
        <p>Start exploring</p>
    </div>`;
    watchlistBtn.style.display = "block";
    inputContainer.style.display = "flex";
    searchForMoviesBtn.style.display = "none";
}

function renderMsgUnableToFind(){
    mainEl.innerHTML = `
    <div id="start-exploring">
        <p>Unable to find what you're looking for.</p>
        <p>Please try with another search.</p>
    </div>`;
}

function renderEmptyWatchlist(){
    movieInput.value = '';
    mainEl.innerHTML = `
    <div id="start-exploring">
        <p>Your watchlist is looking a little empty...</p>
        <button id="search-movies"><i class="fa-solid fa-circle-plus"></i> Let's add some movies!</button>
    </div>`;
    document.getElementById("search-movies").addEventListener("click", renderStartExploring);
}

watchlistBtn.addEventListener("click", function(){
    if (watchlistData.length === 0) {
        renderEmptyWatchlist();
    } else {
        mainEl.innerHTML = watchlistHTML;
    }
    watchlistBtn.style.display = "none";
    inputContainer.style.display = "none";
    searchForMoviesBtn.style.display = "block";
})

searchForMoviesBtn.addEventListener("click", renderStartExploring);

document.addEventListener("click", function(e){
    if (e.target.dataset.id !== undefined) {
        const addItem = findItem(moviesSearchData, e)
        if (!findItem(watchlistData, e)) {
            watchlistData.push(addItem)
            watchlistHTML = watchlistData.map(movie => `
                <div class="movie-container">
                    <div class="movie-poster">
                        <img src="${movie.Poster === "N/A" ? "" : movie.Poster} alt="${movie.Title} poster"/>
                    </div>
                    <div class="movie-info">
                        <div>
                            <h2 class="movie-title">${movie.Title}</h2>
                            <p class="movie-rating"><i class="fa-solid fa-star"></i> ${movie.imdbRating === "N/A" ? "-" : movie.imdbRating}</p>
                        </div>
                        <div class="movie-details">
                            <p class="movie-runtime">${movie.Runtime}</p>
                            <p class="movie-genre">${movie.Genre}</p>
                            <button id="remove-from-watchlist" class="remove-from-watchlist" data-id="${movie.imdbID}"><i class="fa-solid fa-circle-minus"></i> remove</button>
                        </div>
                        <p class="movie-plot">${movie.Plot === "N/A" ? "There is not plot available at this time." : movie.Plot}</p>
                    </div>
                </div>`).join("");
            }
    }

    if (e.target.classList.contains("remove-from-watchlist")) {
        watchlistData = watchlistData.filter(item => item.imdbID !== e.target.dataset.id);
        watchlistHTML = watchlistData.map(movie => `
            <div class="movie-container">
                <div class="movie-poster">
                    <img src="${movie.Poster === "N/A" ? "" : movie.Poster} alt="${movie.Title} poster"/>
                </div>
                <div class="movie-info">
                    <div>
                        <h2 class="movie-title">${movie.Title}</h2>
                        <p class="movie-rating"><i class="fa-solid fa-star"></i> ${movie.imdbRating === "N/A" ? "-" : movie.imdbRating}</p>
                    </div>
                    <div class="movie-details">
                        <p class="movie-runtime">${movie.Runtime}</p>
                        <p class="movie-genre">${movie.Genre}</p>
                        <button id="remove-from-watchlist" class="remove-from-watchlist" data-id="${movie.imdbID}"><i class="fa-solid fa-circle-minus"></i> remove</button>
                    </div>
                    <p class="movie-plot">${movie.Plot === "N/A" ? "There is not plot available at this time." : movie.Plot}</p>
                </div>
            </div>`).join("");
        if (watchlistData.length === 0) {
            renderEmptyWatchlist();
        } else {
            mainEl.innerHTML = watchlistHTML;
        }
    }
})

function findItem(arr, e) {
    return arr.find(item => item.imdbID === e.target.dataset.id);
};

renderStartExploring();

