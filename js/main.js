// ===========================
//   VARIABLES
// ===========================
let productos = [];
let carrito = [];

// Elementos del DOM
const listadoProductos = document.getElementById("listadoProductos");
const barraBusqueda = document.getElementById("barraBusqueda");

const productosCarrito = document.getElementById("productosCarrito");
const totalPagar = document.getElementById("totalPagar");

const botonNombre = document.getElementById("ordenNombre");
const botonPrecio = document.getElementById("ordenPrecio");
const botonVaciar = document.getElementById("vaciarCarrito");

const boton_imprimir = document.getElementById("imprimirTicket")

// ===========================
//   OBTENER PRODUCTOS API
// ===========================
async function obtenerProductos() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/products");
        const data = await respuesta.json();

        productos = data.payload;   // <- tu backend usa payload
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

// ===========================
//   MOSTRAR PRODUCTOS
// ===========================
function mostrarProductos(array) {
    listadoProductos.innerHTML = "";

    array.forEach(prod => {
        const itemHTML = `
            <div class="card-producto">
                <img src="${prod.image}" alt="${prod.name}">
                <h3>${prod.name}</h3>
                <p>$${Number(prod.price).toFixed(2)}</p>
                <button onclick="agregarACarrito(${prod.id})">Agregar al Carrito</button>
            </div>
        `;
        listadoProductos.innerHTML += itemHTML;
    });
}

// ===========================
//   BUSCADOR
// ===========================
barraBusqueda.addEventListener("keyup", () => {
    const texto = barraBusqueda.value.toLowerCase();

    const filtrados = productos.filter(prod =>
        prod.name.toLowerCase().includes(texto)
    );

    mostrarProductos(filtrados);
});

// ===========================
//   CARRITO
// ===========================
function cargarCarrito() {
    const guardado = localStorage.getItem("carritoLocal");

    if (guardado) {
        carrito = JSON.parse(guardado);
        mostrarCarrito();
    }
}

function guardarCarrito() {
    localStorage.setItem("carritoLocal", JSON.stringify(carrito));
}

function agregarACarrito(id) {
    const producto = productos.find(p => p.id === id);

    if (!producto) return;

    carrito.push(producto);
    mostrarCarrito();
    guardarCarrito();
}

function mostrarCarrito() {
    productosCarrito.innerHTML = "";

    carrito.forEach((item, i) => {
        productosCarrito.innerHTML += `
            <li class="bloque-item">
                <p>${item.name} - $${Number(item.price).toFixed(2)}</p>
                <button onclick="eliminarProducto(${i})" class="boton-eliminar">Eliminar</button>
            </li>
        `;
    });

    calcularTotal();
}

function eliminarProducto(indice) {
    carrito.splice(indice, 1);
    mostrarCarrito();
    guardarCarrito();
}

function calcularTotal() {
    const total = carrito.reduce((acc, item) => acc + Number(item.price), 0);
    totalPagar.textContent = `$${total.toFixed(2)}`;
}

// Vaciar carrito
botonVaciar.addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
    guardarCarrito();
});

// ===========================
//   ORDENAR PRODUCTOS
// ===========================
botonNombre.addEventListener("click", () => {
    const ordenados = [...productos].sort((a, b) =>
        a.name.localeCompare(b.name)
    );
    mostrarProductos(ordenados);
});

botonPrecio.addEventListener("click", () => {
    const ordenados = [...productos].sort((a, b) =>
        Number(a.price) - Number(b.price)
    );
    mostrarProductos(ordenados);
});

// ===========================
//   IMPRIMIR TICKET
// ===========================

boton_imprimir.addEventListener("click", imprimirTicket);

function imprimirTicket(){
    console.table(carrito);

    const idProductos = [];
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF;

    let y = 10;
    doc.setFontSize(16);
    doc.text("Ferreteria-ticket de compra: ", 10, y);
    y+= 10;
    doc.setFontSize(12);
    carrito.forEach(producto => {
        idProductos.push(producto.id);

        doc.text(`${producto.name} - ${producto.price}`, 10, y);
        y += 7;
    })

    const total = carrito.reduce((total, producto) => total + parseInt(producto.price), 0);
    y += 5;
    doc.text(`Total: $${total}`, 10, y);

    doc.save("ticket.pdf");
}

// ===========================
//   INICIALIZAR
// ===========================
obtenerProductos();
cargarCarrito();
