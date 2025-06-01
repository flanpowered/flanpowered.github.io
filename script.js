// Datos del itinerario
const itineraryData = {
    "sections": [
        {
            "title": "Día 1 - Museo del Prado",
            "stops": [
                {
                    "name": "Museo del Prado",
                    "startTime": "10:00",
                    "endTime": "13:00",
                    "date": "2024-06-10",
                    "image": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fastelus.com%2Fwp-content%2Fviajes%2FVisita-Museo-del-Prado.png",
                    "description": "El Museo del Prado es uno de los museos más importantes del mundo, con una extensa colección de arte europeo."
                }
            ]
        },
        {
            "title": "Día 2 - Parque del Retiro",
            "stops": [
                {
                    "name": "Parque del Retiro",
                    "startTime": "14:00",
                    "endTime": "17:00",
                    "date": "2024-06-11",
                    "image": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fa.cdn-hotels.com%2Fgdcs%2Fproduction84%2Fd314%2Fef4c0fcd-c07e-41c2-b847-774f1eccaa73.jpg",
                    "description": "El Parque del Retiro es uno de los pulmones verdes de Madrid, con jardines históricos y monumentos."
                }
            ]
        }
    ]
};

// Función para actualizar el reloj
function updateClock(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Calcular ángulos para las manecillas
    const startAngle = (startHour % 12) * 30 + startMinute * 0.5;
    const endAngle = (endHour % 12) * 30 + endMinute * 0.5;
    
    // Actualizar manecillas
    document.querySelector('.hour-hand').style.transform = `rotate(${startAngle}deg)`;
    document.querySelector('.minute-hand').style.transform = `rotate(${startMinute * 6}deg)`;
    
    // Actualizar arco de tiempo usando SVG
    const timeArc = document.querySelector('.time-arc');
    const size = 200; // Tamaño del reloj
    const radius = size / 2; // Radio del arco
    const center = size / 2; // Centro del reloj
    
    // Convertir ángulos a radianes
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calcular puntos del arco
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    // Crear el path del arco
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    // Actualizar el SVG
    timeArc.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="${pathData}" fill="rgba(0, 123, 255, 0.1)" stroke="rgba(0, 123, 255, 0.3)" stroke-width="2"/>
    </svg>`;
}

// Función para actualizar el calendario
function updateCalendar(date) {
    const calendar = document.querySelector('.calendar');
    const eventDate = new Date(date);
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    calendar.innerHTML = `
        <div class="calendar-header">
            <h3>${monthNames[eventDate.getMonth()]} ${eventDate.getFullYear()}</h3>
        </div>
        <div class="calendar-body">
            <div class="calendar-date ${eventDate.getDate()}">
                ${eventDate.getDate()}
            </div>
        </div>
    `;
}

// Función para mostrar la información de una parada
function showStopInfo(stop) {
    document.getElementById('location-img').src = stop.image;
    document.getElementById('location-title').textContent = stop.name;
    document.getElementById('location-text').textContent = stop.description;
    
    updateClock(stop.startTime, stop.endTime);
    updateCalendar(stop.date);
}

// Función para renderizar el itinerario
function renderItinerary() {
    const sectionsContainer = document.querySelector('.sections');
    sectionsContainer.innerHTML = ''; // Limpiar el contenedor
    
    itineraryData.sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        
        sectionElement.innerHTML = `
            <h3 class="section-title">${section.title}</h3>
            ${section.stops.map((stop, index) => `
                <div class="stop" data-stop-index="${index}" data-section-index="${itineraryData.sections.indexOf(section)}">
                    <h4>${stop.name}</h4>
                    <p>${stop.startTime} - ${stop.endTime}</p>
                </div>
            `).join('')}
        `;
        
        sectionsContainer.appendChild(sectionElement);
    });
    
    // Agregar event listeners a las paradas
    document.querySelectorAll('.stop').forEach(stopElement => {
        stopElement.addEventListener('click', () => {
            const sectionIndex = parseInt(stopElement.dataset.sectionIndex);
            const stopIndex = parseInt(stopElement.dataset.stopIndex);
            const stop = itineraryData.sections[sectionIndex].stops[stopIndex];
            
            // Remover clase active de todas las paradas
            document.querySelectorAll('.stop').forEach(el => el.classList.remove('active'));
            // Agregar clase active a la parada seleccionada
            stopElement.classList.add('active');
            
            showStopInfo(stop);
        });
    });
    
    // Mostrar la primera parada por defecto
    if (itineraryData.sections[0]?.stops[0]) {
        const firstStop = document.querySelector('.stop');
        firstStop.classList.add('active');
        showStopInfo(itineraryData.sections[0].stops[0]);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    renderItinerary();
});