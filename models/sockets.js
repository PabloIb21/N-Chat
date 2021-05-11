const { 
    usuarioConectado,
    usuarioDesconectado,
    getUsuarios,
    grabarMensaje
} = require('../controllers/sockets');
const { comprobarJWT } = require('../helpers/jwt');

class Sockets {

    constructor( io ) {

        this.io = io;

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', async( socket ) => {

            const [ valido, uid ] = comprobarJWT( socket.handshake.query['x-token'] );

            if ( !valido ) {
                console.log('Socket no identificado');
                return socket.disconnect();
            }

            await usuarioConectado( uid );

            // Unir al usuario a un sala de socket.io
            socket.join( uid );

            // Validar el JWT
            // Si el token no es válido, desconectar

            // Saber que usuario está activo mediante el UID

            // Emitir todos los usuarios conectados
            this.io.emit('lista-usuarios', await getUsuarios() );

            // Socket join, uid

            // Escuchar cuando el cliente manda un mensaje
            socket.on('mensaje-personal', async( payload ) => {
                const mensaje = await grabarMensaje( payload );
                this.io.to( payload.para ).emit('mensaje-personal', mensaje );
                this.io.to( payload.de ).emit('mensaje-personal', mensaje );
            });

            // Disconnect
            // Marcar en la BD que el usuario se desconecto
            socket.on('disconnect', async() => {
                await usuarioDesconectado( uid );
                this.io.emit('lista-usuarios', await getUsuarios() );
            });

            // Emitir todos los usuarios conectados
        
        });
    }


}


module.exports = Sockets;