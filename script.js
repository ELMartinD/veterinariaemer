// Carrito inicial vacío
let carrito = [];

// Función para agregar un producto al carrito
function agregarAlCarrito(event) {
    const boton = event.target.closest('button');
    const producto = {
        id: boton.getAttribute('data-id'),
        nombre: boton.getAttribute('data-nombre'),
        precio: parseFloat(boton.getAttribute('data-precio')),
        precio_descuento: boton.getAttribute('data-precio_descuento') === 'null' ? null : parseFloat(boton.getAttribute('data-precio_descuento')),
        imagen: boton.getAttribute('data-imagen')
    };

    // Ahora puedes agregar el producto al carrito o hacer lo que necesites con él
    console.log(producto);
    // Llamar a la función para agregar al carrito
    carrito.push(producto);
    actualizarCarrito();
}






// Función para actualizar el panel del carrito
function actualizarCarrito() {
    const carritoContainer = document.getElementById('carrito-panel');
    const totalContainer = document.getElementById('total-carrito');

    carritoContainer.innerHTML = '';  // Limpiar contenido previo
    let total = 0;

    // Mostrar los productos del carrito
    carrito.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto-carrito');
        productoDiv.innerHTML = `
            <img src="/uploads/${producto.imagen}" width="50">
            <p>${producto.nombre}</p>
            <p>$${producto.precio_descuento || producto.precio}</p>
            <button class="boton-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        carritoContainer.appendChild(productoDiv);

        // Sumar el precio para calcular el total
        total += producto.precio_descuento || producto.precio;
    });

    // Mostrar el total en el panel del carrito
    totalContainer.innerHTML = `Total: $${total.toFixed(2)}`;
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(index) {
    // Eliminar el producto del carrito usando el índice
    carrito.splice(index, 1);

    // Actualizar el panel del carrito después de la eliminación
    actualizarCarrito();
}




document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('productForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Evita el envío del formulario
        // El resto de tu código aquí...
    });
});




document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Evita que el formulario se envíe de la manera tradicional

    const formData = new FormData(this);  // Captura los datos del formulario

    fetch('http://localhost:3000/admin/add-product', {
        method: 'POST',
        body: formData,  // Enviamos los datos del formulario
    })
    .then(response => response.text())  // Recibimos la respuesta del servidor
    .then(data => {
        // Mostrar mensaje flotante de éxito
        if (data.includes("correctamente")) {
            mostrarMensajeFlotante('Producto agregado correctamente');
            document.getElementById('productForm').reset();  // Limpia el formulario
            cargarProductos();  // Recargar productos después de agregar uno nuevo
        } else {
            mostrarMensajeFlotante('El producto ya existe');
        }
    })
    .catch(error => {
        console.error('Error al enviar el formulario:', error);
        mostrarMensajeFlotante('Hubo un problema al enviar el formulario');
    });
});

// Función para mostrar el mensaje flotante
function mostrarMensajeFlotante(mensaje) {
    const mensajeFlotante = document.createElement('div');
    mensajeFlotante.classList.add('mensaje-flotante');
    mensajeFlotante.innerText = mensaje;

    // Agregar el mensaje al contenedor de mensajes
    document.getElementById('message-container').appendChild(mensajeFlotante);

    // El mensaje se desvanecerá después de 3 segundos
    setTimeout(() => {
        mensajeFlotante.style.opacity = '0';
        setTimeout(() => {
            mensajeFlotante.remove();  // Eliminar el mensaje del DOM después de que se desvanezca
        }, 500);
    }, 3000);
}

// Función para editar un producto
function editarProducto(id, nombre, precio, precio_descuento, descripcion, imagen, seccion) {
    const editFormContainer = document.getElementById('editFormContainer');
    editFormContainer.style.display = 'block';  // Mostrar formulario de edición

    const createProductForm = document.getElementById('productForm');
    createProductForm.style.display = 'none';  // Ocultar formulario de creación

    document.getElementById('formTitle').innerText = "Editar Publicación";

    document.getElementById('editProductId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editPrecio').value = precio;
    document.getElementById('editPrecio_descuento').value = precio_descuento;
    document.getElementById('editDescripcion').value = descripcion;
    document.getElementById('editImagen').value = '';  // Limpiar el campo de archivo
    document.getElementById('editSeccion').value = seccion;

    document.getElementById('editProductForm').action = `http://localhost:3000/admin/edit-product/${id}`;
}

// Función para eliminar un producto
async function eliminarProducto(id) {
    const response = await fetch(`http://localhost:3000/admin/delete-product/${id}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        mostrarMensajeFlotante('Producto eliminado');
        cargarProductos();  // Recargar la lista de productos
    } else {
        mostrarMensajeFlotante('Error al eliminar el producto');
    }
}

// Escuchar el evento submit en el formulario de edición (editar producto)
document.getElementById('editProductForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Evita que el formulario se envíe de la manera tradicional

    const formData = new FormData(this);  // Captura los datos del formulario
    const id = document.getElementById('editProductId').value;  // Obtener el ID del producto

    fetch(`http://localhost:3000/admin/edit-product/${id}`, {
        method: 'POST',
        body: formData,  // Enviar los datos del formulario
    })
    .then(response => response.text())  // Recibimos la respuesta del servidor
    .then(data => {
        if (data.includes("correctamente")) {
            mostrarMensajeFlotante('Producto actualizado correctamente');
            cargarProductos();  // Recargar productos después de editar uno
            document.getElementById('editProductForm').reset();  // Limpiar el formulario de edición
            document.getElementById('editFormContainer').style.display = 'none';  // Ocultar formulario de edición
            document.getElementById('productForm').style.display = 'block';  // Volver a mostrar el formulario de creación
        } else {
            mostrarMensajeFlotante('Hubo un error al actualizar el producto');
        }
    })
    .catch(error => {
        console.error('Error al editar el producto:', error);
        mostrarMensajeFlotante('Hubo un problema al editar el producto');
    });
});


// Cargar las publicaciones existentes
async function cargarProductos() {
    const response = await fetch('http://localhost:3000/productos');
    const productos = await response.json();

    const productosContainer = document.getElementById('productos-list');
    productosContainer.innerHTML = ''; // Limpiar contenido previo

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        productoDiv.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>${producto.descripcion}</p>
            <p><del>$${producto.precio}</del></p>
            <p>$${producto.precio_descuento || producto.precio}</p>
            <img src="uploads/${producto.imagen}" width="100">
            <button onclick="editarProducto(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.precio_descuento}, '${producto.descripcion}', '${producto.imagen}', '${producto.seccion}')">Editar</button>
            <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
        `;
        productosContainer.appendChild(productoDiv);
    });
}

// Cambiar URL de localhost a la URL pública de ngrok
const urlBase = 'https://a1dc-190-230-81-138.ngrok-free.app'; // URL de ngrok

// Función para cargar productos
async function cargarProductos() {
    const response = await fetch(`${urlBase}/productos`);  // Asegúrate de que esta ruta esté correcta
    const productos = await response.json();

    const productosContainer = document.getElementById('productos-list');
    productosContainer.innerHTML = '';  // Limpiar contenido previo

    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        productoDiv.innerHTML = `
            <h4>${producto.nombre}</h4>
            <p>${producto.descripcion}</p>
            <p><del>$${producto.precio}</del></p>
            <p>$${producto.precio_descuento || producto.precio}</p>
            <img src="uploads/${producto.imagen}" width="100">
        `;
        productosContainer.appendChild(productoDiv);
    });
}

// Cargar los productos cuando se carga la página
window.onload = cargarProductos;











