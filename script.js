// Variable global para almacenar los datos del itinerario
let itineraryData = null;

// Función para cargar los datos del JSON
async function loadItineraryData() {
    try {
        const response = await fetch('itinerary.json');
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        itineraryData = await response.json();
        renderItinerary();
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.sections').innerHTML = `
            <div class="error-message">
                <h3>Error al cargar el itinerario</h3>
                <p>Por favor, asegúrate de que el archivo itinerary.json existe y es accesible.</p>
            </div>
        `;
    }
}

// Función para actualizar el reloj
function updateClock(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Calcular ángulos para las manecillas
    const startAngle = (startHour % 12) * 30 + startMinute * 0.5;
    const endAngle = (endHour % 12) * 30 + endMinute * 0.5;
    
    // Limpiar el arco de tiempo existente
    const timeArc = document.querySelector('.time-arc');
    timeArc.innerHTML = '';
    
    // Obtener las manecillas actuales
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    
    // Obtener los ángulos actuales
    const currentHourAngle = getCurrentRotation(hourHand);
    const currentMinuteAngle = getCurrentRotation(minuteHand);
    
    // Animar las manecillas
    animateHand(hourHand, currentHourAngle, startAngle, 1000);
    animateHand(minuteHand, currentMinuteAngle, startMinute * 6, 1000);
    
    // Esperar a que termine la animación de las manecillas antes de mostrar el arco
    setTimeout(() => {
        updateTimeArc(startAngle, endAngle);
    }, 1000);
}

// Función para obtener la rotación actual de una manecilla
function getCurrentRotation(element) {
    const transform = window.getComputedStyle(element).getPropertyValue('transform');
    if (transform === 'none') return 0;
    
    const values = transform.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    return Math.round(Math.atan2(b, a) * (180/Math.PI));
}

// Función para animar una manecilla
function animateHand(hand, startAngle, endAngle, duration) {
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Función de easing para suavizar la animación
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentAngle = startAngle + (endAngle - startAngle) * easeProgress;
        hand.style.transform = `rotate(${currentAngle}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Función para actualizar el arco de tiempo
function updateTimeArc(startAngle, endAngle) {
    const timeArc = document.querySelector('.time-arc');
    const size = 250; // Tamaño del reloj
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
    
    // Crear el SVG con el path
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "rgba(0, 123, 255, 0.1)");
    path.setAttribute("stroke", "rgba(0, 123, 255, 0.3)");
    path.setAttribute("stroke-width", "2");
    
    // Añadir la animación usando SMIL
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "opacity");
    animate.setAttribute("from", "0");
    animate.setAttribute("to", "1");
    animate.setAttribute("dur", "0.5s");
    animate.setAttribute("fill", "freeze");
    path.appendChild(animate);
    
    svg.appendChild(path);
    timeArc.innerHTML = '';
    timeArc.appendChild(svg);
}

// Función para actualizar el calendario
function updateCalendar(date) {
    const calendar = document.querySelector('.calendar');
    const eventDate = new Date(date);
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Calcular fechas anteriores y siguientes
    const dates = [];
    for (let i = -3; i <= 3; i++) {
        const newDate = new Date(eventDate);
        newDate.setDate(eventDate.getDate() + i);
        dates.push(newDate);
    }
    
    calendar.innerHTML = `
        <div class="calendar-header">
            <h3>${monthNames[eventDate.getMonth()]} ${eventDate.getFullYear()}</h3>
        </div>
        <div class="calendar-body">
            ${dates.map((date, index) => `
                <div class="calendar-date ${index === 3 ? 'current' : index < 3 ? 'prev' : 'next'}">
                    <span class="day-number">${date.getDate()}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Función para mostrar la información de una parada
function showStopInfo(stop, section) {
    document.getElementById('location-img').src = stop.image;
    document.getElementById('location-title').textContent = stop.name;
    document.getElementById('location-text').textContent = stop.description;
    
    updateClock(stop.startTime, stop.endTime);
    updateCalendar(section.date);
}

// Función para renderizar el itinerario
function renderItinerary() {
    if (!itineraryData) return;
    
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
            const section = itineraryData.sections[sectionIndex];
            const stop = section.stops[stopIndex];
            
            // Remover clase active de todas las paradas
            document.querySelectorAll('.stop').forEach(el => el.classList.remove('active'));
            // Agregar clase active a la parada seleccionada
            stopElement.classList.add('active');
            
            showStopInfo(stop, section);
        });
    });
    
    // Mostrar la primera parada por defecto
    if (itineraryData.sections[0]?.stops[0]) {
        const firstStop = document.querySelector('.stop');
        firstStop.classList.add('active');
        showStopInfo(itineraryData.sections[0].stops[0], itineraryData.sections[0]);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadItineraryData();
});