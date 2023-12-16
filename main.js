const buttonAdd = document.getElementById('tambahKota');
const buttonRemove = document.getElementById('HapusKota');
const buttonConnect = document.getElementById('hubungkanKota');
const buttonOptimal = document.getElementById('optimalJarak');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startPointInput = document.getElementById('startPoint');
const endPointInput = document.getElementById('endPoint');


const kota1Input = document.getElementById('kota1');
const kota2Input = document.getElementById('kota2');
const relasiInput = document.getElementById('relasi');

ctx.translate(canvas.width / 2, canvas.height / 2);

const kotaCoordinates = [];
const kotaConnections = [];

buttonAdd.addEventListener('click', () => {
    const kota1 = parseKoordinatInput(kota1Input.value);
    const kota2 = parseKoordinatInput(kota2Input.value);

    if (kota1) kotaCoordinates.push(kota1);
    if (kota2) kotaCoordinates.push(kota2);

    kota1Input.value = '';
    kota2Input.value = '';

    drawPoint();
});

buttonRemove.addEventListener('click', () => {
    kota1Input.value = '';
    kota2Input.value = '';

    removePoint();
});

buttonConnect.addEventListener('click', () => {
    const relasi = relasiInput.value.trim();
    if (relasi !== '') {
        const [kota1, kota2] = relasi.split(',');
        connectPoints(kota1, kota2);
    }
    relasiInput.value = '';
});

buttonOptimal.addEventListener('click', () => {
    findOptimalPath();
});

function parseKoordinatInput(input) {
    const koordinatArray = input.split(',');

    if (koordinatArray.length === 2) {
        const x = parseFloat(koordinatArray[0]);
        const y = parseFloat(koordinatArray[1]);

        if (!isNaN(x) && !isNaN(y)) {
            return {
                x,
                y,
                color: 'black'
            };
        }
    }

    return null;
}

function drawPoint() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    kotaCoordinates.forEach((coord, index) => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = coord.color || 'blue';
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Kota - ${index + 1}`, coord.x, coord.y - 10);
    });

    drawConnections();
}

function drawConnections() {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    kotaConnections.forEach((connection) => {
        const [kota1, kota2] = connection;
        ctx.beginPath();
        ctx.moveTo(kota1.x, kota1.y);
        ctx.lineTo(kota2.x, kota2.y);
        ctx.stroke();
        ctx.closePath();
    });
}

function connectPoints(kota1Index, kota2Index) {
    const kota1 = kotaCoordinates[kota1Index - 1];
    const kota2 = kotaCoordinates[kota2Index - 1];

    if (kota1 && kota2) {
        kotaConnections.push([kota1, kota2]);
        drawConnections();
    }
}

function removePoint() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    kotaCoordinates.length = 0;
    kotaConnections.length = 0;
}

function findOptimalPath() {
    const startLabel = startPointInput.value.trim();
    const endLabel = endPointInput.value.trim();

    if (startLabel === '' || endLabel === '') {
        alert('Masukkan keterangan titik awal dan akhir.');
        return;
    }

    let startFound = false;
    let endFound = false;

    const start = findIndexByLabel(startLabel, startFound);
    const end = findIndexByLabel(endLabel, endFound);


    if (!startFound || !endFound) {
        alert('Keterangan titik awal atau akhir tidak ditemukan.');
        return;
    }
    

    const optimalPath = dijkstra(generateGraph(), start, end);
    highlightOptimalPath(optimalPath);
}

function findIndexByLabel(label, foundFlag) {
    for (let i = 0; i < kotaCoordinates.length; i++) {
        if (`Kota-${i + 1}` === label) {
            foundFlag = true;
            return i;
        }
    }
    foundFlag = false;
    return -1;
}

function generateGraph() {
    const graph = {};

    kotaConnections.forEach(([kota1, kota2]) => {
        const distance = Math.sqrt((kota2.x - kota1.x) ** 2 + (kota2.y - kota1.y) ** 2);

        if (!graph[kota1.index]) {
            graph[kota1.index] = {};
        }

        if (!graph[kota2.index]) {
            graph[kota2.index] = {};
        }

        graph[kota1.index][kota2.index] = distance;
        graph[kota2.index][kota1.index] = distance;
    });

    return graph;
}

function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const nodes = new Set(Object.keys(graph));

    nodes.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });

    distances[start] = 0;

    while (nodes.size > 0) {
        let smallest = null;
        nodes.forEach(node => {
            if (smallest === null || distances[node] < distances[smallest]) {
                smallest = node;
            }
        });

        nodes.delete(smallest);

        if (distances[smallest] === Infinity) {
            break;
        }

        for (const neighbor in graph[smallest]) {
            const alt = distances[smallest] + graph[smallest][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = smallest;
            }
        }
    }

    const path = [];
    let current = end;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return path;
}

function highlightOptimalPath(path) {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    drawPoint();

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;

    for (let i = 0; i < path.length - 1; i++) {
        const kota1 = kotaCoordinates[path[i] - 1];
        const kota2 = kotaCoordinates[path[i + 1] - 1];

        ctx.beginPath();
        ctx.moveTo(kota1.x, kota1.y);
        ctx.lineTo(kota2.x, kota2.y);
        ctx.stroke();
        ctx.closePath();
    }
}