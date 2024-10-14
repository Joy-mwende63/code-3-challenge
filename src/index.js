
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

async function displayFilmList() {
    const films = await fetchFilms();
    const filmsList = $('#films');
    filmsList.empty(); 

    films.forEach(film => {
        const li = $('<li>').addClass('film item').data('id', film.id);
        li.text(film.title);

        const deleteButton = $('<button>')
            .addClass('ui red button')
            .text('Delete')
            .on('click', (e) => {
                e.stopPropagation(); 
                deleteFilm(film.id); 
            });

        li.append(deleteButton);
        filmsList.append(li);

        li.on('click', () => displayFilmDetails(film.id));
    });
    
    if (films.length > 0) {
        displayFilmDetails(films[0].id);
    }
}

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

$('#buy-ticket').on('click', async function () {
    const filmId = $('#films .item.selected').data('id');
    const films = await fetchFilms();
    const film = films.find(f => f.id === filmId);

    if (film) {
        const availableTickets = film.capacity - film.tickets_sold;
        if (availableTickets > 0) {
            film.tickets_sold++;
            
            await fetch(`http://localhost:3000/films/${filmId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tickets_sold: film.tickets_sold })
            });

            alert(`Ticket purchased for ${film.title}!`);
            displayFilmDetails(filmId); 
        } else {
            alert("Sorry, this movie is sold out!");
        }
    }
});
    
displayFilmList();
