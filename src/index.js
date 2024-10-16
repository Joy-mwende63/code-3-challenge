// Fetch all films from the server
async function fetchFilms() {
    try {
        const response = await fetch('http://localhost:3000/films'); 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching films:', error);
        return [];
    }
}

// Create a list item for a film
function createFilmListItem(film) {
    const li = $('<li>').addClass('film item').data('id', film.id).text(film.title);
    
    const deleteButton = $('<button>')
        .addClass('ui red button')
        .text('Delete')
        .on('click', (e) => {
            e.stopPropagation(); 
            deleteFilm(film.id); 
        });

    li.append(deleteButton);
    li.on('click', () => displayFilmDetails(film.id));
    
    return li;
}

// Display the list of films
async function displayFilmList() {
    const films = await fetchFilms();
    const filmsList = $('#films');
    filmsList.empty(); 

    films.forEach(film => {
        const filmItem = createFilmListItem(film);
        filmsList.append(filmItem);
    });

    if (films.length > 0) {
        displayFilmDetails(films[0].id);
    }
}

// Delete a film by its ID
async function deleteFilm(id) {
    try {
        const response = await fetch(`http://localhost:3000/films/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete the film');
        }
        displayFilmList();
    } catch (error) {
        console.error('Error deleting film:', error);
    }
}

// Display details of a specific film
async function displayFilmDetails(id) {
    const films = await fetchFilms();
    const film = films.find(f => f.id === id);
    if (!film) return;

    $('#title').text(film.title);
    $('#runtime').text(`${film.runtime} minutes`);
    $('#film-info').text(film.description);
    $('#showtime').text(film.showtime);

    const availableTickets = film.capacity - film.tickets_sold;
    $('#ticket-num').text(`${availableTickets}`);
    $('#buy-ticket').prop('disabled', availableTickets <= 0);
    $('#poster').attr('src', film.poster); 
}

// Handle ticket purchase
$('#buy-ticket').on('click', async function () {
    const filmId = $('#films .item.selected').data('id');
    const films = await fetchFilms();
    const film = films.find(f => f.id === filmId);

    if (film) {
        const availableTickets = film.capacity - film.tickets_sold;
        if (availableTickets > 0) {
            film.tickets_sold++;
            await updateFilmTickets(filmId, film.tickets_sold);
            alert(`Ticket purchased for ${film.title}!`);
            displayFilmDetails(filmId); 
        } else {
            alert("Sorry, this movie is sold out!");
        }
    }
});

// Update film tickets sold via PATCH
async function updateFilmTickets(filmId, ticketsSold) {
    try {
        await fetch(`http://localhost:3000/films/${filmId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickets_sold: ticketsSold })
        });
    } catch (error) {
        console.error('Error updating film tickets:', error);
    }
}

// Initial display of films
displayFilmList();

