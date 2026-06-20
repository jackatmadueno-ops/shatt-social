// ========== CONFIGURACIÓN GLOBAL COMPARTIDA ==========
const PB_URL = 'https://shatt-social-production.up.railway.app';
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

let configuracionGlobal = null;
let currentUserGlobal = null;

// Cargar configuración del usuario desde PocketBase
async function cargarConfiguracionGlobal() {
    const saved = localStorage.getItem('pocketbase_auth');
    if (!saved) return;
    
    try {
        const { token, model } = JSON.parse(saved);
        pb.authStore.save(token, model);
    } catch(e) {}
    
    if (!pb.authStore.isValid) return;
    currentUserGlobal = pb.authStore.model;
    if (!currentUserGlobal) return;
    
    try {
        const configs = await pb.collection('configuraciones').getList(1, 1, {
            filter: `usuario = "${currentUserGlobal.id}"`
        });
        
        if (configs.items.length > 0) {
            configuracionGlobal = configs.items[0];
            aplicarConfiguracion(configuracionGlobal);
        } else {
            // Crear configuración por defecto
            const newConfig = await pb.collection('configuraciones').create({
                usuario: currentUserGlobal.id,
                tema: 'light',
                color_fondo: '#3a6186',
                opacidad: 1,
                accent_color: '#3b5998',
                tamaño_fuente: 16
            });
            configuracionGlobal = newConfig;
            aplicarConfiguracion(newConfig);
        }
    } catch(e) {
        console.error("Error cargando configuración:", e);
        aplicarConfiguracionDesdeLocalStorage();
    }
}

// Aplicar configuración al DOM
function aplicarConfiguracion(config) {
    if (!config) return;
    
    // Modo oscuro
    if (config.tema === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Color de fondo
    if (config.color_fondo) {
        document.body.style.background = config.color_fondo;
    }
    
    // Opacidad
    if (config.opacidad) {
        document.documentElement.style.setProperty('--panel-opacity', config.opacidad);
    }
    
    // Color de acento
    if (config.accent_color) {
        document.documentElement.style.setProperty('--shatt-blue', config.accent_color);
    }
    
    // Tamaño de fuente
    if (config.tamaño_fuente) {
        document.documentElement.style.fontSize = config.tamaño_fuente + 'px';
    }
    
    // Imagen de fondo
    if (config.imagen_fondo) {
        try {
            const url = pb.files.getUrl(config, config.imagen_fondo);
            document.body.style.background = `url(${url}) center/cover fixed`;
        } catch(e) {}
    }
}

// Aplicar configuración desde localStorage (fallback)
function aplicarConfiguracionDesdeLocalStorage() {
    const dark = localStorage.getItem('shatt_darkmode') === 'true';
    if (dark) document.body.classList.add('dark-mode');
    
    const bg = localStorage.getItem('shatt_bg');
    if (bg) document.body.style.background = bg;
    
    const opacity = localStorage.getItem('shatt_opacity');
    if (opacity) {
        document.documentElement.style.setProperty('--panel-opacity', opacity);
    }
}

// Guardar configuración en PocketBase
async function guardarConfiguracionGlobal(data) {
    if (!currentUserGlobal || !configuracionGlobal) {
        mostrarToast("❌ No hay configuración activa", true);
        return;
    }
    
    try {
        const updated = await pb.collection('configuraciones').update(configuracionGlobal.id, data);
        configuracionGlobal = updated;
        aplicarConfiguracion(updated);
        
        // Sincronizar con otras pestañas
        localStorage.setItem('shatt_config_update', Date.now().toString());
        
        // También guardar en localStorage para rápido acceso
        if (data.tema) localStorage.setItem('shatt_darkmode', data.tema === 'dark');
        if (data.color_fondo) localStorage.setItem('shatt_bg', data.color_fondo);
        if (data.opacidad) localStorage.setItem('shatt_opacity', data.opacidad);
        
        mostrarToast("💾 Configuración guardada en la nube");
    } catch(e) {
        console.error("Error guardando configuración:", e);
        mostrarToast("❌ Error al guardar", true);
    }
}

// ========== FUNCIONES DE PERSONALIZACIÓN ==========

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('shatt_darkmode', isDark);
    guardarConfiguracionGlobal({ tema: isDark ? 'dark' : 'light' });
}

function setBgColorGlobal(color) {
    document.body.style.background = color;
    guardarConfiguracionGlobal({ color_fondo: color });
}

function setImageBgGlobal(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        document.body.style.background = `url(${url}) center/cover fixed`;
        
        const formData = new FormData();
        formData.append('imagen_fondo', file);
        guardarConfiguracionGlobal(formData);
        
        mostrarToast("🖼️ Imagen de fondo guardada");
    }
}

function setOpacityGlobal(val) {
    document.documentElement.style.setProperty('--panel-opacity', val);
    guardarConfiguracionGlobal({ opacidad: parseFloat(val) });
}

function setAccentColorGlobal(color) {
    document.documentElement.style.setProperty('--shatt-blue', color);
    guardarConfiguracionGlobal({ accent_color: color });
    mostrarToast("🎨 Color de acento actualizado");
}

function setFontSizeGlobal(size) {
    document.documentElement.style.fontSize = size + 'px';
    const fontDisplay = document.getElementById('font-size-display');
    if (fontDisplay) fontDisplay.textContent = size + 'px';
    guardarConfiguracionGlobal({ tamaño_fuente: parseInt(size) });
    mostrarToast("📏 Tamaño de fuente actualizado");
}

async function guardarDisenoGlobal() {
    const bg = document.body.style.background;
    const opacity = getComputedStyle(document.documentElement).getPropertyValue('--panel-opacity');
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--shatt-blue');
    const isDark = document.body.classList.contains('dark-mode');
    
    await guardarConfiguracionGlobal({
        color_fondo: bg,
        opacidad: parseFloat(opacity) || 1,
        accent_color: accent || '#3b5998',
        tema: isDark ? 'dark' : 'light'
    });
    
    localStorage.setItem('shatt_bg', bg);
    localStorage.setItem('shatt_opacity', opacity);
    mostrarToast("💾 Diseño guardado en la nube");
}

async function resetearDisenoGlobal() {
    if (!confirm("¿Restaurar diseño por defecto?")) return;
    
    try {
        await pb.collection('configuraciones').update(configuracionGlobal.id, {
            tema: 'light',
            color_fondo: '#3a6186',
            opacidad: 1,
            accent_color: '#3b5998',
            imagen_fondo: null,
            tamaño_fuente: 16
        });
        
        await cargarConfiguracionGlobal();
        mostrarToast("🔄 Diseño restaurado");
        location.reload();
    } catch(e) {
        console.error("Error restaurando diseño:", e);
        mostrarToast("❌ Error al restaurar", true);
    }
}

// ========== MOSTRAR TOAST ==========
function mostrarToast(mensaje) {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:white;padding:12px 24px;border-radius:50px;font-size:14px;z-index:10000;display:none;max-width:90%;text-align:center;';
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.display = 'block';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.style.display = 'none', 2000);
}

// ========== SINCRONIZAR ENTRE PESTAÑAS ==========
window.addEventListener('storage', function(e) {
    if (e.key === 'shatt_config_update') {
        cargarConfiguracionGlobal();
    }
});

// ========== CARGAR CONFIGURACIÓN AUTOMÁTICAMENTE ==========
document.addEventListener('DOMContentLoaded', function() {
    cargarConfiguracionGlobal();
});