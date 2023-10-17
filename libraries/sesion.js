/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global Swal */

var tiempoInactividad = 600;
var activo_ = true;
$(document).ready(function () {
    console.log("OLA");
    getMac();
    verificarSesionActiva();
    cerrarSesionInactividad();
    actualizarActividad();
});


function cerrarSesionInactividad() {
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
    if (sPage !== 'index.html') {
        var proceso = setInterval(function () {
            if (tiempoInactividad === 0) {
                clearInterval(proceso);
                cerrarSesion("La sesión ha excedido el tiempo de inactividad y deberá cerrarse.");
            }
            tiempoInactividad--;
        }, 1000);
    }
}

function cerrarSesion() {
    var sesion = setRegSesion(macLocal, 1, 0, 0);
    setSesion(sesion);
    window.location.href = localStorage.getItem('ipLocal') + "index.php";
}
function cerrarSesion_(mensaje) {
    alert(mensaje);
    cerrarSesion();
}
function actualizarActividad() {
    var sPath = window.location.pathname;
    var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
    if (sPage !== 'index.html') {
        setInterval(function () {
            if (activo_) {
                activo_ = false;
                var sesion = setRegSesion(macLocal, 1, 0, 1);
                setSesion(sesion);
            }
        }, 5000);
    }
}

var macLocal;
function getMac() {
    $.ajax({
        url: localStorage.getItem('ipLocal') + 'index.php/Cconfiguracion/getMac',
        type: 'post',
        async: false,
        success: function (mac) {
            if (mac !== '') {
                macLocal = mac;
            } else {
                getMacServer();
            }

        }
    });
}

function getMacServer() {
    $.ajax({
        url: localStorage.getItem('ipLocal') + 'index.php/Cconfiguracion/getMacServer',
        type: 'post',
        async: false,
        success: function (mac) {
            if (localStorage.getItem("mac") == undefined || localStorage.getItem("mac") == "" || localStorage.getItem("mac") == null) {
                localStorage.setItem("mac", mac);
            }
            if (mac !== '' || (localStorage.getItem("mac") !== "" || localStorage.getItem("mac") !== null)) {
                macLocal = localStorage.getItem("mac");
            } else {
                alert('El sistema no reconoce la MAC de este equipo');
            }
        }
    });
}

function setRegSesion(mac, tipo, ip, estado) {
    var sesion = new Object();
    sesion.device = mac.toString().toUpperCase();
    sesion.user = localStorage.getItem('IdUsuario');
    sesion.tipo = tipo;
    sesion.ip = ip;
    sesion.estado = estado;
    return sesion;
}

function setSesion(control_sesion) {
    var data = {
        control_sesion: control_sesion
    };
    $.ajax({
        url: localStorage.getItem('ipLocal') + "index.php/Csesion/setSesion",
        async: false,
        data: data,
        type: 'post'
    });
}

function verificarSesionActiva() {
    var data = {
        user: localStorage.getItem('IdUsuario')
    };
    $.ajax({
        url: localStorage.getItem('ipLocal') + "index.php/Csesion/getSesionUser",
        async: false,
        data: data,
        type: 'post',
        success: function (rta) {
            console.log(rta);
            console.log(macLocal.toUpperCase());
            var entrar = true;
            if (rta !== "FALSE") {
                rta = JSON.parse(rta);
                rta.forEach(function (usuario) {
                    if (usuario.user === localStorage.getItem('IdUsuario') &&
                            macLocal.toUpperCase() !== usuario.device &&
                            usuario.estado === "1" &&
                            usuario.tipo === "1" &&
                            usuario.tiempo <= 300) {
                        entrar = false;
                    }
                });
                if (!entrar) {
                    cerrarSesion_("Este usuario ya tiene una sesión activa, por favor cierre sesión en la otra instancia.");
                } else {
                    updateSesionDevice(1);
                    var sesion = setRegSesion(macLocal, 1, 0, 1);
                    setSesion(sesion);
                }
            } else {
                updateSesionDevice(1);
                var sesion = setRegSesion(macLocal, 1, 0, 1);
                setSesion(sesion);
            }
        }
    });
}

function updateSesionDevice(tipo) {
    var data = {
        tipo: tipo,
        estado: 0,
        device: macLocal.toUpperCase()
    };
    $.ajax({
        url: localStorage.getItem('ipLocal') + "index.php/Csesion/updateSesionDevice",
        async: false,
        data: data,
        type: 'post'
    });
}

window.onmousemove = function (e) {
    tiempoInactividad = 600;
    activo_ = true;
};
window.onclick = function (e) {
    tiempoInactividad = 600;
    activo_ = true;
};
window.onkeydown = function (e) {
    tiempoInactividad = 600;
    activo_ = true;
};

var AlertTecmmas = function (icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text
    });
};