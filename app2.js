const express = require('express');
const app = express();
const PORT = 8080;

// Middleware para parsear JSON
app.use(express.json());

// Datos iniciales (simulando una base de datos)
let usuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, nombre: 'María García', email: 'maria@example.com' }
];

let libros = [
    { id: 1, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', existencia: 5 },
    { id: 2, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', existencia: 3 }
];

let prestamos = [
    { id: 1, id_usuario: 1, id_libro: 1, fecha_prestamo: '2023-01-01', fecha_devolucion: '2023-01-15' },
    { id: 2, id_usuario: 2, id_libro: 2, fecha_prestamo: '2023-01-02', fecha_devolucion: '2023-01-16' }
];

let resenias = [
    { id: 1, id_usuario: 1, id_libro: 1, calificacion: 5, comentario: 'Excelente libro' },
    { id: 2, id_usuario: 2, id_libro: 2, calificacion: 4, comentario: 'Muy bueno' }
];

// Rutas para Usuarios
app.get('/usuarios', (req, res) => {
    res.json(usuarios);
});

app.get('/usuarios/:id', (req, res) => {
    const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if (!usuario) return res.status(404).send('Usuario no encontrado');
    res.json(usuario);
});

app.post('/usuarios', (req, res) => {
    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre: req.body.nombre,
        email: req.body.email
    };
    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);
});

app.put('/usuarios/:id', (req, res) => {
    const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    usuario.nombre = req.body.nombre || usuario.nombre;
    usuario.email = req.body.email || usuario.email;

    res.json(usuario);
});

app.delete('/usuarios/:id', (req, res) => {
    const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(req.params.id));
    if (usuarioIndex === -1) return res.status(404).send('Usuario no encontrado');

    const usuarioEliminado = usuarios.splice(usuarioIndex, 1);
    res.json(usuarioEliminado);
});

// Rutas para Libros
app.get('/libros', (req, res) => {
    res.json(libros);
});

app.get('/libros/:id', (req, res) => {
    const libro = libros.find(l => l.id === parseInt(req.params.id));
    if (!libro) return res.status(404).send('Libro no encontrado');
    res.json(libro);
});

app.post('/libros', (req, res) => {
    const nuevoLibro = {
        id: libros.length + 1,
        titulo: req.body.titulo,
        autor: req.body.autor,
        existencia: req.body.existencia || 1
    };
    libros.push(nuevoLibro);
    res.status(201).json(nuevoLibro);
});

app.put('/libros/:id', (req, res) => {
    const libro = libros.find(l => l.id === parseInt(req.params.id));
    if (!libro) return res.status(404).send('Libro no encontrado');

    libro.titulo = req.body.titulo || libro.titulo;
    libro.autor = req.body.autor || libro.autor;
    libro.existencia = req.body.existencia || libro.existencia;

    res.json(libro);
});

app.put('/libros/:id/existencia', (req, res) => {
    const libro = libros.find(l => l.id === parseInt(req.params.id));
    if (!libro) return res.status(404).send('Libro no encontrado');

    if (req.body.existencia === undefined) {
        return res.status(400).send('Se requiere el campo "existencia"');
    }

    libro.existencia = req.body.existencia;
    res.json(libro);
});

app.delete('/libros/:id', (req, res) => {
    const libroIndex = libros.findIndex(l => l.id === parseInt(req.params.id));
    if (libroIndex === -1) return res.status(404).send('Libro no encontrado');

    const libroEliminado = libros.splice(libroIndex, 1);
    res.json(libroEliminado);
});

// Rutas para Préstamos
app.get('/prestamos', (req, res) => {
    res.json(prestamos);
});

app.get('/prestamos/:id', (req, res) => {
    const prestamo = prestamos.find(p => p.id === parseInt(req.params.id));
    if (!prestamo) return res.status(404).send('Préstamo no encontrado');
    res.json(prestamo);
});

app.post('/prestamos', (req, res) => {
    // Verificar que el libro existe y tiene existencia disponible
    const libro = libros.find(l => l.id === req.body.id_libro);
    if (!libro) return res.status(404).send('Libro no encontrado');
    if (libro.existencia < 1) return res.status(400).send('No hay ejemplares disponibles');

    // Verificar que el usuario existe
    const usuario = usuarios.find(u => u.id === req.body.id_usuario);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    const nuevoPrestamo = {
        id: prestamos.length + 1,
        id_usuario: req.body.id_usuario,
        id_libro: req.body.id_libro,
        fecha_prestamo: req.body.fecha_prestamo || new Date().toISOString().split('T')[0],
        fecha_devolucion: req.body.fecha_devolucion || null
    };

    // Reducir la existencia del libro
    libro.existencia -= 1;

    prestamos.push(nuevoPrestamo);
    res.status(201).json(nuevoPrestamo);
});

app.put('/prestamos/:id', (req, res) => {
    const prestamo = prestamos.find(p => p.id === parseInt(req.params.id));
    if (!prestamo) return res.status(404).send('Préstamo no encontrado');

    if (req.body.id_usuario) {
        const usuario = usuarios.find(u => u.id === req.body.id_usuario);
        if (!usuario) return res.status(404).send('Usuario no encontrado');
        prestamo.id_usuario = req.body.id_usuario;
    }

    if (req.body.id_libro) {
        const libro = libros.find(l => l.id === req.body.id_libro);
        if (!libro) return res.status(404).send('Libro no encontrado');
        
        // Si cambió el libro, devolver el anterior y tomar el nuevo
        if (prestamo.id_libro !== req.body.id_libro) {
            const libroAnterior = libros.find(l => l.id === prestamo.id_libro);
            libroAnterior.existencia += 1;
            libro.existencia -= 1;
        }
        
        prestamo.id_libro = req.body.id_libro;
    }

    prestamo.fecha_prestamo = req.body.fecha_prestamo || prestamo.fecha_prestamo;
    prestamo.fecha_devolucion = req.body.fecha_devolucion || prestamo.fecha_devolucion;

    res.json(prestamo);
});

app.delete('/prestamos/:id', (req, res) => {
    const prestamoIndex = prestamos.findIndex(p => p.id === parseInt(req.params.id));
    if (prestamoIndex === -1) return res.status(404).send('Préstamo no encontrado');

    // Devolver el libro al eliminar el préstamo
    const prestamo = prestamos[prestamoIndex];
    const libro = libros.find(l => l.id === prestamo.id_libro);
    libro.existencia += 1;

    const prestamoEliminado = prestamos.splice(prestamoIndex, 1);
    res.json(prestamoEliminado);
});

// Rutas para Reseñas
app.get('/resenias', (req, res) => {
    res.json(resenias);
});

app.get('/resenias/:id', (req, res) => {
    const resenia = resenias.find(r => r.id === parseInt(req.params.id));
    if (!resenia) return res.status(404).send('Reseña no encontrada');
    res.json(resenia);
});

app.get('/resenias/libro/:id_libro', (req, res) => {
    const reseniasLibro = resenias.filter(r => r.id_libro === parseInt(req.params.id_libro));
    res.json(reseniasLibro);
});

app.post('/resenias', (req, res) => {
    // Verificar que el usuario existe
    const usuario = usuarios.find(u => u.id === req.body.id_usuario);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    // Verificar que el libro existe
    const libro = libros.find(l => l.id === req.body.id_libro);
    if (!libro) return res.status(404).send('Libro no encontrado');

    const nuevaResenia = {
        id: resenias.length + 1,
        id_usuario: req.body.id_usuario,
        id_libro: req.body.id_libro,
        calificacion: req.body.calificacion,
        comentario: req.body.comentario
    };

    resenias.push(nuevaResenia);
    res.status(201).json(nuevaResenia);
});

app.put('/resenias/:id', (req, res) => {
    const resenia = resenias.find(r => r.id === parseInt(req.params.id));
    if (!resenia) return res.status(404).send('Reseña no encontrada');

    resenia.calificacion = req.body.calificacion || resenia.calificacion;
    resenia.comentario = req.body.comentario || resenia.comentario;

    res.json(resenia);
});

app.delete('/resenias/:id', (req, res) => {
    const reseniaIndex = resenias.findIndex(r => r.id === parseInt(req.params.id));
    if (reseniaIndex === -1) return res.status(404).send('Reseña no encontrada');

    const reseniaEliminada = resenias.splice(reseniaIndex, 1);
    res.json(reseniaEliminada);
});

// Lógicas específicas
app.get('/libros/disponibles', (req, res) => {
    const librosDisponibles = libros.filter(l => l.existencia > 0);
    res.json(librosDisponibles);
});

app.get('/prestamos/usuario/:id_usuario', (req, res) => {
    const prestamosUsuario = prestamos.filter(p => p.id_usuario === parseInt(req.params.id_usuario));
    res.json(prestamosUsuario);
});

app.get('/prestamos/libro/:id_libro', (req, res) => {
    const prestamosLibro = prestamos.filter(p => p.id_libro === parseInt(req.params.id_libro));
    res.json(prestamosLibro);
});

// Iniciar el servido
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

