const apiKey = "5d3283853b012d8fcc790df1c83226a1";
const imgPath = "https://image.tmdb.org/t/p/w500";
const searchInput = document.getElementById("searchbar");
const main_grid = document.querySelector(".movies-grid");
const popup_container = document.querySelector(".popup-container");
const favoritesMovieGrid=document.querySelector('.favorites-movie');
const noImgPath =
  "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png";

function show_popup(card) {
  console.log("Popup is shown" + card);
}

function add_click_effect_to_card(cards) {
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      show_popup(card);
    });
  });
}
async function search() {
  let query = searchInput.value;
  const resp = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`
  );
  const respData = await resp.json();
  const results = respData.results;
  main_grid.innerHTML = results
    .map((movie) => {
      return `
     <div class="card" data-id="${movie.id}">
            <div class="img">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="">
            </div>
            <div class="info">
                <h2>${movie.title}</h2>
                <div class="single-info">
                    <span>Rate: </span>
                    <span>${movie.vote_average} / 10</span>
                </div>
                 <div class="single-info">
                    <span>Release Date:</span>
                    <span>${movie.release_date}</span>
                </div>
            </div>
        </div>
     `;
    })
    .join("");
  console.log(results);
  const cards = document.querySelectorAll(".card");
  add_click_effect_to_card(cards);
}

async function get_movie_by_id(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
  );
  const respdata = await resp.json();
  return respdata;
}

async function get_movie_trailer(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`
  );
  const respdata = await resp.json();
  if (respdata.results.length > 0) {
    return respdata.results[0].key;
  } else {
    return respdata.results;
  }
}

async function show_popup(card) {
  popup_container.classList.add("show-popup");
  const movie_id = card.getAttribute("data-id");
  const movie = await get_movie_by_id(movie_id);
  console.log(movie);
  const movie_trailer = await get_movie_trailer(movie_id);
  console.log(imgPath + movie.poster_path);
  if (movie.poster_path != null) {
    popup_container.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${
      imgPath + movie.poster_path
    })`;
  } else {
    popup_container.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${noImgPath})`;
  }
  popup_container.innerHTML = `
    <span class="x-icon">&#10006</span>
    <div class="content">
        <div class="left">
            <div class="poster-img">
                <img src="${imgPath + movie.poster_path}" alt="">
            </div>
            <div class="single-info">
                <span>Add to favorites:</span>
                <span class="heart-icon">&#10084;</span>
            </div>
        </div>
        <div class="right">
            <h1>${movie.title}</h1>
            <h3>${movie.tagline}</h2>
            <div class="single-info-container">
                <div class="single-info">
                    <span>Language:</span>
                    <span>${movie.spoken_languages[0].name}</span>
                </div>
                <div class="single-info">
                    <span>Length:</span>
                    <span>${movie.runtime} minutes</span>
                </div>
                <div class="single-info">
                    <span>Rate:</span>
                    <span>${Math.round(movie.vote_average)} / 10</span>
                </div>
                <div class="single-info">
                    <span>Budget</span>
                    <span>${movie.budget}$</span>
                </div>
                <div class="single-info">
                    <span>Release Date:</span>
                    <span>${movie.release_date}</span>
                </div>
            </div>
            <div class="genres">
                <h2>Genres</h2>
                <ul>
                    ${
                      movie.genres.length > 0
                        ? movie.genres.map((e) => `<li>${e.name}</li>`).join("")
                        : `<li>No Results</li>`
                    }
                </ul>
            </div>
            <div class="overview">
                <h2>Overview</h2>
                <p>${movie.overview}</p>
            </div>
            <div class="trailer">
                <h2>Trailer</h2>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${movie_trailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>`;

  const x_icon = document.querySelector(".x-icon");
  x_icon.addEventListener('click',()=>{
    popup_container.classList.remove('show-popup')
  });

  const heart_icon=document.querySelector('.heart-icon');
  heart_icon.addEventListener('click',()=>{
    if (heart_icon.classList.contains('change-color')) {
      remove_LS(movie_id)
      heart_icon.classList.remove('change-color');
    }
    else{
      const test=get_LS();
      if (test.indexOf(movie_id)>-1) {
        alert('Zaten Ekli');
      }
      else{
        heart_icon.classList.add('change-color');
        add_to_LS(movie_id)
      }
      
    }
    fetch_favorite_movies();
  })
}


function get_LS() {
  const movie_ids=JSON.parse(localStorage.getItem('movie-id'));
  return movie_ids==null ? [] : movie_ids
}

function add_to_LS(id) {
  const movide_ids=get_LS()
  localStorage.setItem('movie-id',JSON.stringify([...movide_ids,id]))
}

function remove_LS(id) {
  const movide_ids=get_LS();
  localStorage.setItem('movie-id',JSON.stringify(movide_ids.filter(e=> e !== id)))
}


fetch_favorite_movies();
async function fetch_favorite_movies() {
  const movies_LS=await get_LS();
  const movies=[];
  for (let i = 0; i < movies_LS.length; i++) {
    const movie_id=movies_LS[i];
    let movie=await get_movie_by_id(movie_id);
    movies.push(movie);
    add_favorties_to_dom_from_LS(movies);
    console.log(movies);
  }
}

function add_favorties_to_dom_from_LS(movies) {
  favoritesMovieGrid.innerHTML=movies.map(movie=>{
    return `
    <div class="card" data-id="${movie.id}">
    <div class="img">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="">
    </div>
    <div class="info">
        <h2>${movie.title}</h2>
        <div class="single-info">
            <span>Rate: </span>
            <span>${movie.vote_average} / 10</span>
        </div>
        <div class="single-info">
            <span>Release Date:</span>
            <span>${movie.release_date}</span>
        </div>
    </div>
  </div>
`
  }).join('')
}