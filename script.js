function openTab(tabName) {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";

    // Call fetchEvents when the 'events' tab is opened
    if (tabName === 'events') {
        fetchEvents();
    }

    // call createNews when the 'news' tab is opened
    if (tabName === 'news') {
        createNews();
    }
}




/* Event Functions */

// Deletes events that end date have passed
function deletePastEvents(events) {
    const currentDate = new Date();
    return events.filter(event => new Date(event.endDate) > currentDate);
}

function userHasRSVPed(eventId) {
    // Example implementation with local storage (you might want to use a more persistent method)
    const rsvpedEvents = JSON.parse(localStorage.getItem('rsvpedEvents')) || [];
    return rsvpedEvents.includes(eventId);
}

// Function to Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper Function to Create an Event Card
function createEventCard(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-card';
    const dateRange = formatDateRange(event.startDate, event.endDate);
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURI(event.location)}`;

    // Shortened location for display
    const shortLocation = event.location.split(',')[0];
    const imageUrl = event.imageURL || 'https://wallpapers.com/images/featured/solid-grey-ew5fya1gh2bgc49b.jpg';
    eventDiv.innerHTML = `
        <div class="event-image" style="background-image: url('${imageUrl}');"></div>
        <div class="event-header">
        <h3 class="event-title">${event.eventName || 'No Event Name'}</h3>
        <a href="${mapsLink}" target="_blank" class="event-location">${shortLocation || 'No Location'}</a>
</div>
    <div class="event-body">
        <p class="event-description">${truncateDescription(event.description) || 'No Description'}</p>
        <p class="event-dateRange">${dateRange}</p>
    </div>
        `;

    // Event click to open modal
    eventDiv.addEventListener('click', () => openModal(event));
    return eventDiv;
}

// Fetch Events Function
async function fetchEvents() {
    try {
        const response = await fetch('https://8ph64ep4g4.execute-api.us-east-1.amazonaws.com/prod/events');
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        const events = JSON.parse(data.body);
        const validEvents = deletePastEvents(events);
        const popularEvents = validEvents.sort((a, b) => b.peopleAttending - a.peopleAttending).slice(0, 6);
        console.log(popularEvents);

        displayEvents(popularEvents, 'topEventsContainer'); // Display top 8 events

        // resort events based on their starting date
        const sortedEvents = validEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        let displayedEvents = 0;
        const eventsPerPage = 16; // Adjust as needed
        displayEvents(sortedEvents.slice(0, eventsPerPage), 'allEventsContainer');

        function viewMoreEvents() {
            displayedEvents += eventsPerPage;
            displayEvents(sortedEvents.slice(0, displayedEvents + eventsPerPage), 'allEventsContainer');
            dispayedEvents += eventsPerPage;

        }

        document.getElementById("viewMoreButton").addEventListener("click", viewMoreEvents);
        // Implement grouping and display for all events (if required)
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function filterEvents() {
    const selectedDate = document.getElementById('dateFilter').value;
    const filteredEvents = sortedEvents.filter(event =>
        new Date(event.startDate).toDateString() === new Date(selectedDate).toDateString()
    );

    displayEvents(filteredEvents, 'allEventsContainer');
}

// Function to Display Events in a Container
function displayEvents(events, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear existing content

    events.forEach(event => {
        const eventDiv = createEventCard(event);
        container.appendChild(eventDiv);
    });
}



function truncateDescription(description) {
    // Function to truncate description with "..."
    return description.length > 100 ? description.substring(0, 97) + '...' : description;
}

// Open Modal Function
function openModal(event) {
    const modal = document.getElementById('eventModal');
    const modalDetails = document.getElementById('modalDetails');
    const rsvpButton = document.getElementById('rsvpButton');
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURI(event.location)}`;

    modalDetails.innerHTML = `
    <h2>${event.eventName}</h2>
    <a href="${mapsLink}" target="_blank"><strong>Location:</strong> ${event.location}</a></p>
    <p><strong>Description:</strong> ${event.description}</p>
    <p><strong>Start Date:</strong> ${formatDate(event.startDate)}</p>
    <p><strong>End Date:</strong> ${formatDate(event.endDate)}</p>
        `;

    modal.style.display = 'block';

    if (userHasRSVPed(event.eventID)) {
        rsvpButton.disabled = true;
        rsvpButton.innerHTML = 'Your Going!';
    } else {
        rsvpButton.disabled = false;
    }

    rsvpButton.onclick = async () => {
        console.log('RSVP for', event.eventName);
        console.log('ID:', event.eventID);
        try {
            console.log(JSON.stringify({ eventId: Number(event.eventID) }));
            const response = await fetch('https://75nibl6bhl.execute-api.us-east-1.amazonaws.com/prod/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Send the Event ID to the server
                body: JSON.stringify({ eventId: Number(event.eventID) }),
            },);
            console.log(response);
            if (!response.ok) {
                throw new Error('RSVP failed');
            }
            // Update the event display or show a confirmation message

            const rsvpedEvents = JSON.parse(localStorage.getItem('rsvpedEvents')) || [];
            rsvpedEvents.push(event.eventID);
            localStorage.setItem('rsvpedEvents', JSON.stringify(rsvpedEvents));
            rsvpButton.disabled = true;
        } catch (error) {
            console.error('Error RSVPing:', error);
            console.error('Error RSVPing:', error.message);
        }
    };
}

function addEvent() {
    document.getElementById('addEventModal').style.display = 'block';
}

function closeAddEventModal() {
    document.getElementById('addEventModal').style.display = 'none';
}

// Submitting the Add Event Form
document.getElementById('addEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventName = document.getElementById('eventName').value;
    const eventAddress = document.getElementById('eventAddress').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventImageURL = document.getElementById('eventImageURL').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Generate a unique EventID. This is a basic example; you may want to use a more robust method.
    const eventDetails = {
        eventId: Date.now().toString(),
        location: eventAddress,
        description: eventDescription,
        endDate: endDate,
        eventName: eventName,
        imageURL: eventImageURL,
        peopleAttending: "0",
        startDate: startDate
    };

    try {
        const response = await fetch('https://yz05npqw4g.execute-api.us-east-1.amazonaws.com/post/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventDetails)
        });

        const responseData = await response.json();
        console.log(responseData);

        if (!response.ok) {
            throw new Error(`Event creation failed: ${responseData.message || response.statusText}`);
        }

        // Handle successful response
        closeAddEventModal();
        // Optionally, refresh the events displayed on the page
        console.log('Event created successfully');
    } catch (error) {
        console.error('Error adding event:', error);
    }
});


// Close Modal Functions
window.onclick = function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('eventModal').style.display = 'none';
});

function formatDateRange(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
        return "Invalid date range";
    }

    const startDateFormat = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const endDateFormat = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    return `${startDateFormat} to ${endDateFormat}`;
}

fetchEvents();



/* New Functions */
function createNews() {
    const news1 = {
        title: "Tractor-Trailer down embankment slows I-79 Traffic",
        description: "A tractor-trailer crash Friday afternoon was slowing traffic on Interstate 78 through Northampton County.",
        imageURL: "https://www.lehighvalleylive.com/resizer/u5UGoDXIsdI50vqd6s16PJamFF0=/1280x0/smart/cloudfront-us-east-1.images.arcpublishing.com/advancelocal/Q7FU4SNECNGENFRYBI4MCXMZFA.jpg",
        link: "https://www.lehighvalleylive.com/news/2023/11/tractor-trailer-down-embankment-slows-i-78-traffic.html",
    }
    const news2 = {
        title: "Steel Stacks Performance",
        description: "Enjoy indoor dining at the Capital BlueCross Creativity Commons with live music performed on the Williams Brew Stage",
        imageURL: "Thumbnail2.png",
        link: "https://www.steelstacks.org/event/13806/the-jam-experience/",
    }
    const news3 = {
        title: "Parkland girls soccer scores early, earns shutout state playoff win",
        description: "It’s been a good past few days for Parkland junior midfielder Emma Hull.",
        imageURL: "https://www.lehighvalleylive.com/resizer/U5_SqJVxpdRW0AFRUosQFZizxgY=/1280x0/smart/cloudfront-us-east-1.images.arcpublishing.com/advancelocal/KZPLM7JGS5E4VBJYYBTJRX7O4M.JPG",
        link: "https://www.lehighvalleylive.com/highschoolsports/2023/11/parkland-girls-soccer-scores-early-earns-shutout-state-playoff-win.html",
    }
    const news4 = {
        title: "Crases News",
        description: "High school football scoreboard for Nov. 10-11",
        imageURL: "Thumbnail1.png",
        link: "https://www.lehighvalleylive.com/highschoolsports/2023/11/high-school-football-scoreboard-for-nov-10-11.html",
    }

    news = [news1, news2, news3, news4];
    displayNews(news, "newsContainer");
}
function displayNews(newsArticles, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear existing content

    newsArticles.forEach(newsItem => {
        const newsDiv = createNewsCard(newsItem);
        container.appendChild(newsDiv);
    });
}

function createNewsCard(news) {
    const newsDiv = document.createElement('div');
    newsDiv.className = 'news-card';
    const imageUrl = news.imageURL || 'default-image-url.jpg'; // Replace with a default image URL if needed
    newsDiv.innerHTML = `
    <div class="news-image" style="background-image: url('${imageUrl}');"></div>
    <div class="news-header">
      <h3 class="news-title">${news.title}</h3>
    </div>
    <div class="event-body">
      <p class="event-description">${truncateDescription(news.description)}</p>
    </div>
  `;
    newsDiv.addEventListener('click', () => redirectToArticle(news.link));
    return newsDiv;
}

function redirectToArticle(newsLink) {
    window.location.href = newsLink;
}

// createNews(); // Call this function to initialize the news section
