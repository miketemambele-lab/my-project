import { 
    auth, 
    db, 
    isUserAdmin, 
    getUserRole, 
    getUserData,
    getOnlineUsers,
    getAllUsers,
    logoutUser,
    createNewUser
} from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    setDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

let currentUserID = null;
let medicationsData = [];
let usersData = [];

// Show Alert Function
function showAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('alertDiv');
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show alert-custom" role="alert" style="margin-bottom: 20px;">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
        </div>
    `;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// Language translations
const translations = {
    en: {
        // Navigation
        "Admin Panel": "Admin Panel",
        "Admin": "Admin",
        "Edit Profile": "Edit Profile",
        "Settings": "Settings",
        "Logout": "Logout",
        
        // Tabs
        "Dashboard": "Dashboard",
        "Users & Online": "Users & Online",
        "Stock Management": "Stock Management",
        "Sales Reports": "Sales Reports",
        "Manage Users": "Manage Users",
        "Customer Inquiries": "Customer Inquiries",
        
        // Dashboard
        "Total Users": "Total Users",
        "Online Now": "Online Now",
        "Total Medications": "Total Medications",
        "Low Stock Items": "Low Stock Items",
        
        // Profile Modal
        "Edit Profile": "Edit Profile",
        "Display Name": "Display Name",
        "Email Address": "Email Address",
        "Account Role": "Account Role",
        "Administrator": "Administrator",
        "Member Since": "Member Since",
        "Change Password": "Change Password",
        "Current Password": "Current Password",
        "New Password": "New Password",
        "Confirm New Password": "Confirm New Password",
        "Save Changes": "Save Changes",
        "Cancel": "Cancel",
        
        // Settings Modal
        "System Settings": "System Settings",
        "General": "General",
        "Notifications": "Notifications",
        "Security": "Security",
        "Data & Export": "Data & Export",
        "Theme Preferences": "Theme Preferences",
        "Dashboard Theme": "Dashboard Theme",
        "Default (Blue/Purple)": "Default (Blue/Purple)",
        "Dark Mode": "Dark Mode",
        "Light Mode": "Light Mode",
        "System Preferences": "System Preferences",
        "Auto-refresh dashboard data": "Auto-refresh dashboard data",
        "Show welcome message on login": "Show welcome message on login",
        "Use compact view for tables": "Use compact view for tables",
        "Notification Preferences": "Notification Preferences",
        "EMAIL NOTIFICATIONS": "EMAIL NOTIFICATIONS",
        "New user registrations": "New user registrations",
        "Low stock alerts": "Low stock alerts",
        "Daily sales reports": "Daily sales reports",
        "SYSTEM NOTIFICATIONS": "SYSTEM NOTIFICATIONS",
        "System errors and warnings": "System errors and warnings",
        "Backup completion notifications": "Backup completion notifications",
        "Security alerts": "Security alerts",
        "Password Security": "Password Security",
        "Session Timeout": "Session Timeout",
        "30 minutes": "30 minutes",
        "1 hour": "1 hour",
        "4 hours": "4 hours",
        "8 hours": "8 hours",
        "Enable two-factor authentication": "Enable two-factor authentication",
        "Force password change for all users": "Force password change for all users",
        "Access Control": "Access Control",
        "Enable IP whitelist": "Enable IP whitelist",
        "Failed Login Attempts": "Failed Login Attempts",
        "3 attempts": "3 attempts",
        "5 attempts": "5 attempts",
        "10 attempts": "10 attempts",
        "View login history": "View login history",
        "Data Export": "Data Export",
        "Export system data for backup or analysis": "Export system data for backup or analysis",
        "Export Users Data": "Export Users Data",
        "Export Inventory Data": "Export Inventory Data",
        "Export Sales Data": "Export Sales Data",
        "Export All Data": "Export All Data",
        "Data Management": "Data Management",
        "Manage system data and backups": "Manage system data and backups",
        "Create Backup": "Create Backup",
        "Clear System Logs": "Clear System Logs",
        "Reset to Defaults": "Reset to Defaults",
        "Save Settings": "Save Settings"
    },
    sw: {
        // Navigation
        "Admin Panel": "Jopo la Msimamizi",
        "Admin": "Msimamizi",
        "Edit Profile": "Hariri Wasifu",
        "Settings": "Mipangilio",
        "Logout": "Ondoka",
        
        // Tabs
        "Dashboard": "Dashibodi",
        "Users & Online": "Watumiaji & Mtandaoni",
        "Stock Management": "Usimamizi wa Hisa",
        "Sales Reports": "Ripoti za Mauzo",
        "Manage Users": "Simamia Watumiaji",
        "Customer Inquiries": "Maswali ya Wateja",
        
        // Dashboard
        "Total Users": "Jumla ya Watumiaji",
        "Online Now": "Mtandaoni Sasa",
        "Total Medications": "Jumla ya Dawa",
        "Low Stock Items": "Vipengee vya Hisa Kidogo",
        
        // Profile Modal
        "Edit Profile": "Hariri Wasifu",
        "Display Name": "Jina la Kuonyesha",
        "Email Address": "Anwani ya Barua Pepe",
        "Account Role": "Jukumu la Akaunti",
        "Administrator": "Msimamizi",
        "Member Since": "Mwanachama Tangu",
        "Change Password": "Badilisha Nenosiri",
        "Current Password": "Nenosiri la Sasa",
        "New Password": "Nenosiri Mpya",
        "Confirm New Password": "Thibitisha Nenosiri Mpya",
        "Save Changes": "Hifadhi Mabadiliko",
        "Cancel": "Ghairi",
        
        // Settings Modal
        "System Settings": "Mipangilio ya Mfumo",
        "General": "Kwa Ujumla",
        "Notifications": "Arifa",
        "Security": "Usalama",
        "Data & Export": "Data & Uhamisho",
        "Theme Preferences": "Mapendeleo ya Mandhari",
        "Dashboard Theme": "Mandhari ya Dashibodi",
        "Default (Blue/Purple)": "Chaguo-msingi (Bluu/Zambarau)",
        "Dark Mode": "Hali ya Giza",
        "Light Mode": "Hali ya Mwanga",
        "System Preferences": "Mapendeleo ya Mfumo",
        "Auto-refresh dashboard data": "Onyesha upya data ya dashibodi kiotomatiki",
        "Show welcome message on login": "Onyesha ujumbe wa kukaribisha wakati wa kuingia",
        "Use compact view for tables": "Tumia mwonekano wa kompakt kwa jedwali",
        "Notification Preferences": "Mapendeleo ya Arifa",
        "EMAIL NOTIFICATIONS": "ARIFA ZA BARUA PEPE",
        "New user registrations": "Usajili wa watumiaji wapya",
        "Low stock alerts": "Arifa za hisa kidogo",
        "Daily sales reports": "Ripoti za mauzo ya kila siku",
        "SYSTEM NOTIFICATIONS": "ARIFA ZA MFUMO",
        "System errors and warnings": "Makosa na onyo za mfumo",
        "Backup completion notifications": "Arifa za kukamilika kwa chelezo",
        "Security alerts": "Arifa za usalama",
        "Password Security": "Usalama wa Nenosiri",
        "Session Timeout": "Muda wa Kikao",
        "30 minutes": "Dakika 30",
        "1 hour": "Saa 1",
        "4 hours": "Saa 4",
        "8 hours": "Saa 8",
        "Enable two-factor authentication": "Wezesha uthibitishaji wa hatua mbili",
        "Force password change for all users": "Lazimisha mabadiliko ya nenosiri kwa watumiaji wote",
        "Access Control": "Udhibiti wa Ufikiaji",
        "Enable IP whitelist": "Wezesha orodha nyeupe ya IP",
        "Failed Login Attempts": "Majaribio ya Kuingia Yaliyoshindikana",
        "3 attempts": "Majaribio 3",
        "5 attempts": "Majaribio 5",
        "10 attempts": "Majaribio 10",
        "View login history": "Tazama historia ya kuingia",
        "Data Export": "Uhamisho wa Data",
        "Export system data for backup or analysis": "Hamisha data ya mfumo kwa chelezo au uchambuzi",
        "Export Users Data": "Hamisha Data ya Watumiaji",
        "Export Inventory Data": "Hamisha Data ya Hisa",
        "Export Sales Data": "Hamisha Data ya Mauzo",
        "Export All Data": "Hamisha Data Zote",
        "Data Management": "Usimamizi wa Data",
        "Manage system data and backups": "Simamia data ya mfumo na chelezo",
        "Create Backup": "Tengeneza Chelezo",
        "Clear System Logs": "Futa Kumbukumbu za Mfumo",
        "Reset to Defaults": "Weka upya kwa Chaguo-msingi",
        "Save Settings": "Hifadhi Mipangilio"
    },
    es: {
        // Navigation
        "Admin Panel": "Panel de Administrador",
        "Admin": "Admin",
        "Edit Profile": "Editar Perfil",
        "Settings": "Configuraciones",
        "Logout": "Cerrar Sesión",
        
        // Tabs
        "Dashboard": "Panel de Control",
        "Users & Online": "Usuarios & En Línea",
        "Stock Management": "Gestión de Inventario",
        "Sales Reports": "Reportes de Ventas",
        "Manage Users": "Gestionar Usuarios",
        "Customer Inquiries": "Consultas de Clientes",
        
        // Dashboard
        "Total Users": "Total de Usuarios",
        "Online Now": "En Línea Ahora",
        "Total Medications": "Total de Medicamentos",
        "Low Stock Items": "Artículos con Stock Bajo",
        
        // Profile Modal
        "Edit Profile": "Editar Perfil",
        "Display Name": "Nombre para Mostrar",
        "Email Address": "Dirección de Correo",
        "Account Role": "Rol de Cuenta",
        "Administrator": "Administrador",
        "Member Since": "Miembro Desde",
        "Change Password": "Cambiar Contraseña",
        "Current Password": "Contraseña Actual",
        "New Password": "Nueva Contraseña",
        "Confirm New Password": "Confirmar Nueva Contraseña",
        "Save Changes": "Guardar Cambios",
        "Cancel": "Cancelar",
        
        // Settings Modal
        "System Settings": "Configuraciones del Sistema",
        "General": "General",
        "Notifications": "Notificaciones",
        "Security": "Seguridad",
        "Data & Export": "Datos y Exportación",
        "Theme Preferences": "Preferencias de Tema",
        "Dashboard Theme": "Tema del Panel",
        "Default (Blue/Purple)": "Predeterminado (Azul/Púrpura)",
        "Dark Mode": "Modo Oscuro",
        "Light Mode": "Modo Claro",
        "System Preferences": "Preferencias del Sistema",
        "Auto-refresh dashboard data": "Actualizar automáticamente datos del panel",
        "Show welcome message on login": "Mostrar mensaje de bienvenida al iniciar sesión",
        "Use compact view for tables": "Usar vista compacta para tablas",
        "Notification Preferences": "Preferencias de Notificación",
        "EMAIL NOTIFICATIONS": "NOTIFICACIONES POR CORREO",
        "New user registrations": "Nuevos registros de usuarios",
        "Low stock alerts": "Alertas de stock bajo",
        "Daily sales reports": "Reportes diarios de ventas",
        "SYSTEM NOTIFICATIONS": "NOTIFICACIONES DEL SISTEMA",
        "System errors and warnings": "Errores y advertencias del sistema",
        "Backup completion notifications": "Notificaciones de finalización de respaldo",
        "Security alerts": "Alertas de seguridad",
        "Password Security": "Seguridad de Contraseña",
        "Session Timeout": "Tiempo de Espera de Sesión",
        "30 minutes": "30 minutos",
        "1 hour": "1 hora",
        "4 hours": "4 horas",
        "8 hours": "8 horas",
        "Enable two-factor authentication": "Habilitar autenticación de dos factores",
        "Force password change for all users": "Forzar cambio de contraseña para todos los usuarios",
        "Access Control": "Control de Acceso",
        "Enable IP whitelist": "Habilitar lista blanca de IP",
        "Failed Login Attempts": "Intentos de Inicio de Sesión Fallidos",
        "3 attempts": "3 intentos",
        "5 attempts": "5 intentos",
        "10 attempts": "10 intentos",
        "View login history": "Ver historial de inicios de sesión",
        "Data Export": "Exportación de Datos",
        "Export system data for backup or analysis": "Exportar datos del sistema para respaldo o análisis",
        "Export Users Data": "Exportar Datos de Usuarios",
        "Export Inventory Data": "Exportar Datos de Inventario",
        "Export Sales Data": "Exportar Datos de Ventas",
        "Export All Data": "Exportar Todos los Datos",
        "Data Management": "Gestión de Datos",
        "Manage system data and backups": "Gestionar datos del sistema y respaldos",
        "Create Backup": "Crear Respaldo",
        "Clear System Logs": "Limpiar Registros del Sistema",
        "Reset to Defaults": "Restablecer a Valores Predeterminados",
        "Save Settings": "Guardar Configuraciones"
    },
    fr: {
        // Navigation
        "Admin Panel": "Panneau d'Administration",
        "Admin": "Admin",
        "Edit Profile": "Modifier le Profil",
        "Settings": "Paramètres",
        "Logout": "Déconnexion",
        
        // Tabs
        "Dashboard": "Tableau de Bord",
        "Users & Online": "Utilisateurs & En Ligne",
        "Stock Management": "Gestion des Stocks",
        "Sales Reports": "Rapports de Ventes",
        "Manage Users": "Gérer les Utilisateurs",
        "Customer Inquiries": "Demandes Clients",
        
        // Dashboard
        "Total Users": "Total des Utilisateurs",
        "Online Now": "En Ligne Maintenant",
        "Total Medications": "Total des Médicaments",
        "Low Stock Items": "Articles en Stock Faible",
        
        // Profile Modal
        "Edit Profile": "Modifier le Profil",
        "Display Name": "Nom d'Affichage",
        "Email Address": "Adresse Email",
        "Account Role": "Rôle du Compte",
        "Administrator": "Administrateur",
        "Member Since": "Membre Depuis",
        "Change Password": "Changer le Mot de Passe",
        "Current Password": "Mot de Passe Actuel",
        "New Password": "Nouveau Mot de Passe",
        "Confirm New Password": "Confirmer le Nouveau Mot de Passe",
        "Save Changes": "Sauvegarder les Modifications",
        "Cancel": "Annuler",
        
        // Settings Modal
        "System Settings": "Paramètres Système",
        "General": "Général",
        "Notifications": "Notifications",
        "Security": "Sécurité",
        "Data & Export": "Données et Exportation",
        "Theme Preferences": "Préférences de Thème",
        "Dashboard Theme": "Thème du Tableau de Bord",
        "Default (Blue/Purple)": "Par Défaut (Bleu/Violet)",
        "Dark Mode": "Mode Sombre",
        "Light Mode": "Mode Clair",
        "System Preferences": "Préférences Système",
        "Auto-refresh dashboard data": "Actualisation automatique des données du tableau de bord",
        "Show welcome message on login": "Afficher le message de bienvenue à la connexion",
        "Use compact view for tables": "Utiliser la vue compacte pour les tableaux",
        "Notification Preferences": "Préférences de Notification",
        "EMAIL NOTIFICATIONS": "NOTIFICATIONS PAR EMAIL",
        "New user registrations": "Nouveaux enregistrements d'utilisateurs",
        "Low stock alerts": "Alertes de stock faible",
        "Daily sales reports": "Rapports de ventes quotidiens",
        "SYSTEM NOTIFICATIONS": "NOTIFICATIONS SYSTÈME",
        "System errors and warnings": "Erreurs et avertissements système",
        "Backup completion notifications": "Notifications de fin de sauvegarde",
        "Security alerts": "Alertes de sécurité",
        "Password Security": "Sécurité du Mot de Passe",
        "Session Timeout": "Délai d'Expiration de Session",
        "30 minutes": "30 minutes",
        "1 hour": "1 heure",
        "4 hours": "4 heures",
        "8 hours": "8 heures",
        "Enable two-factor authentication": "Activer l'authentification à deux facteurs",
        "Force password change for all users": "Forcer le changement de mot de passe pour tous les utilisateurs",
        "Access Control": "Contrôle d'Accès",
        "Enable IP whitelist": "Activer la liste blanche IP",
        "Failed Login Attempts": "Tentatives de Connexion Échouées",
        "3 attempts": "3 tentatives",
        "5 attempts": "5 tentatives",
        "10 attempts": "10 tentatives",
        "View login history": "Voir l'historique des connexions",
        "Data Export": "Exportation de Données",
        "Export system data for backup or analysis": "Exporter les données système pour sauvegarde ou analyse",
        "Export Users Data": "Exporter les Données Utilisateurs",
        "Export Inventory Data": "Exporter les Données d'Inventaire",
        "Export Sales Data": "Exporter les Données de Ventes",
        "Export All Data": "Exporter Toutes les Données",
        "Data Management": "Gestion des Données",
        "Manage system data and backups": "Gérer les données système et sauvegardes",
        "Create Backup": "Créer une Sauvegarde",
        "Clear System Logs": "Effacer les Journaux Système",
        "Reset to Defaults": "Réinitialiser aux Valeurs par Défaut",
        "Save Settings": "Sauvegarder les Paramètres"
    }
};

// Apply Language
function applyLanguage(language) {
    currentLanguage = language;
    const langData = translations[language];
    
    if (!langData) return;
    
    // Add transition class for smooth animation
    document.body.classList.add('lang-transition');
    
    // Update navigation
    document.querySelector('.navbar-brand').textContent = langData["Admin Panel"];
    document.getElementById('adminName').textContent = langData["Admin"];
    document.querySelectorAll('.dropdown-item')[0].textContent = langData["Edit Profile"];
    document.querySelectorAll('.dropdown-item')[1].textContent = langData["Settings"];
    document.querySelectorAll('.dropdown-item')[2].textContent = langData["Logout"];
    
    // Update tabs
    const tabButtons = document.querySelectorAll('#adminTabs .nav-link');
    tabButtons[0].textContent = langData["Dashboard"];
    tabButtons[1].textContent = langData["Users & Online"];
    tabButtons[2].textContent = langData["Stock Management"];
    tabButtons[3].textContent = langData["Sales Reports"];
    tabButtons[4].textContent = langData["Manage Users"];
    tabButtons[5].textContent = langData["Customer Inquiries"];
    
    // Update dashboard stats
    document.querySelectorAll('.stat-label')[0].textContent = langData["Total Users"];
    document.querySelectorAll('.stat-label')[1].textContent = langData["Online Now"];
    document.querySelectorAll('.stat-label')[2].textContent = langData["Total Medications"];
    document.querySelectorAll('.stat-label')[3].textContent = langData["Low Stock Items"];
    
    // Update modal titles and buttons
    document.querySelector('#profileModal .modal-title').textContent = langData["Edit Profile"];
    document.querySelector('#settingsModal .modal-title').textContent = langData["System Settings"];
    
    // Update profile form labels
    document.querySelector('label[for="profileDisplayName"]').textContent = langData["Display Name"];
    document.querySelector('label[for="profileEmail"]').textContent = langData["Email Address"];
    document.querySelector('label[for="profileRole"]').textContent = langData["Account Role"];
    document.querySelector('label[for="profileCreatedAt"]').textContent = langData["Member Since"];
    document.querySelector('#profileModal h6').textContent = langData["Change Password"];
    document.querySelector('label[for="currentPassword"]').textContent = langData["Current Password"];
    document.querySelector('label[for="newPassword"]').textContent = langData["New Password"];
    document.querySelector('label[for="confirmPassword"]').textContent = langData["Confirm New Password"];
    document.querySelector('#saveProfileBtn').textContent = langData["Save Changes"];
    document.querySelector('#profileModal .btn-secondary').textContent = langData["Cancel"];
    
    // Update settings tabs
    const settingsTabs = document.querySelectorAll('#settingsTabs .nav-link');
    settingsTabs[0].textContent = langData["General"];
    settingsTabs[1].textContent = langData["Notifications"];
    settingsTabs[2].textContent = langData["Security"];
    settingsTabs[3].textContent = langData["Data & Export"];
    
    // Update settings content
    document.querySelector('#general h6').textContent = langData["Theme Preferences"];
    document.querySelector('label[for="themeSelect"]').textContent = langData["Dashboard Theme"];
    document.querySelector('label[for="languageSelect"]').textContent = "Language"; // Keep in English for consistency
    document.querySelector('#general .card-body h6').textContent = langData["System Preferences"];
    
    // Update checkboxes
    const checkboxes = document.querySelectorAll('#general input[type="checkbox"]');
    checkboxes[0].nextElementSibling.textContent = langData["Auto-refresh dashboard data"];
    checkboxes[1].nextElementSibling.textContent = langData["Show welcome message on login"];
    checkboxes[2].nextElementSibling.textContent = langData["Use compact view for tables"];
    
    // Update notifications section
    document.querySelector('#notifications h6').textContent = langData["Notification Preferences"];
    document.querySelector('#notifications .card-body h6').textContent = langData["EMAIL NOTIFICATIONS"];
    const emailChecks = document.querySelectorAll('#notifications input[type="checkbox"]');
    emailChecks[0].nextElementSibling.textContent = langData["New user registrations"];
    emailChecks[1].nextElementSibling.textContent = langData["Low stock alerts"];
    emailChecks[2].nextElementSibling.textContent = langData["Daily sales reports"];
    document.querySelector('#notifications .card-body h6:last-of-type').textContent = langData["SYSTEM NOTIFICATIONS"];
    emailChecks[3].nextElementSibling.textContent = langData["System errors and warnings"];
    emailChecks[4].nextElementSibling.textContent = langData["Backup completion notifications"];
    emailChecks[5].nextElementSibling.textContent = langData["Security alerts"];
    
    // Update security section
    document.querySelector('#security .card-body h6').textContent = langData["Password Security"];
    document.querySelector('label[for="sessionTimeout"]').textContent = langData["Session Timeout"];
    document.querySelector('#security input[type="checkbox"]').nextElementSibling.textContent = langData["Enable two-factor authentication"];
    document.getElementById('forcePasswordChange').textContent = langData["Force password change for all users"];
    document.querySelector('#security .card-body h6:last-of-type').textContent = langData["Access Control"];
    document.querySelector('#security input[type="checkbox"]:last-of-type').nextElementSibling.textContent = langData["Enable IP whitelist"];
    document.querySelector('label[for="maxLoginAttempts"]').textContent = langData["Failed Login Attempts"];
    document.getElementById('viewLoginHistory').textContent = langData["View login history"];
    
    // Update data section
    document.querySelector('#data .card-body h6').textContent = langData["Data Export"];
    document.querySelector('#data .card-body p').textContent = langData["Export system data for backup or analysis"];
    document.getElementById('exportUsers').textContent = langData["Export Users Data"];
    document.getElementById('exportInventory').textContent = langData["Export Inventory Data"];
    document.getElementById('exportSales').textContent = langData["Export Sales Data"];
    document.getElementById('exportAll').textContent = langData["Export All Data"];
    document.querySelector('#data .card-body h6:last-of-type').textContent = langData["Data Management"];
    document.querySelector('#data .card-body p:last-of-type').textContent = langData["Manage system data and backups"];
    document.getElementById('backupData').textContent = langData["Create Backup"];
    document.getElementById('clearLogs').textContent = langData["Clear System Logs"];
    document.getElementById('resetSettings').textContent = langData["Reset to Defaults"];
    
    // Update save button
    document.getElementById('saveSettingsBtn').textContent = langData["Save Settings"];
    
    // Update language dropdown to show native names
    const langSelect = document.getElementById('languageSelect');
    langSelect.options[0].textContent = language === 'en' ? 'English' : language === 'sw' ? 'Swahili' : language === 'es' ? 'Español' : 'Français';
    langSelect.options[1].textContent = language === 'en' ? 'Swahili' : language === 'sw' ? 'Kiswahili' : language === 'es' ? 'Suajili' : 'Swahili';
    langSelect.options[2].textContent = language === 'en' ? 'Spanish' : language === 'sw' ? 'Kihispania' : language === 'es' ? 'Español' : 'Espagnol';
    langSelect.options[3].textContent = language === 'en' ? 'French' : language === 'sw' ? 'Kifaransa' : language === 'es' ? 'Francés' : 'Français';
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('lang-transition');
    }, 300);
}

// Apply Theme
function applyTheme(theme) {
    const body = document.body;
    
    // Add transition class for smooth animation
    body.classList.add('theme-transition');
    
    // Remove existing theme classes
    body.classList.remove('dark-theme', 'light-theme');
    
    switch(theme) {
        case 'dark':
            body.classList.add('dark-theme');
            break;
        case 'light':
            body.classList.add('light-theme');
            break;
        default:
            // Default theme - no additional class needed
            break;
    }
    
    // Remove transition class after animation
    setTimeout(() => {
        body.classList.remove('theme-transition');
    }, 500);
}

// Check admin on page load
window.addEventListener('DOMContentLoaded', async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log('No authenticated user found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    console.log('Authenticated user:', user.uid);
    
    const isAdmin = await isUserAdmin(user.uid);
    if (!isAdmin) {
        console.log('User is not admin, redirecting to user dashboard');
        showAlert('Access Denied. Admin access required.', 'danger');
        setTimeout(() => window.location.href = 'user-dashboard.html', 2000);
        return;
    }

    currentUserID = user.uid;
    document.getElementById('adminName').textContent = user.displayName || 'Admin';
    
    // Load all data
    await loadDashboardData();
    await loadUsers();
    await loadMedications();
    await loadAllUsers();
    await loadInquiries();

    // Apply saved settings
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    applyTheme(settings.theme || 'default');
    applyLanguage(settings.language || 'en');

    // Set up form handlers
    setupFormHandlers();

    // Auto-refresh data every 30 seconds
    setInterval(async () => {
        await loadDashboardData();
        await loadAllUsers();
    }, 30000);
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Total users
        const usersSnapshot = await getDocs(collection(db, "users"));
        document.getElementById('totalUsers').textContent = usersSnapshot.size - 1; // Exclude admin

        // Online users
        const onlineQuery = query(collection(db, "users"), where("isOnline", "==", true));
        const onlineSnapshot = await getDocs(onlineQuery);
        document.getElementById('onlineUsers').textContent = onlineSnapshot.size;

        // Total medications
        document.getElementById('totalMedications').textContent = medicationsData.length;

        // Low stock
        const lowStock = medicationsData.filter(med => med.quantity <= med.minQuantity);
        document.getElementById('lowStockMeds').textContent = lowStock.length;
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Load Users
async function loadUsers() {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersData = [];
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            usersData.push(user);

            if (user.uid === currentUserID) return; // Skip self

            const status = user.isOnline ? '<span class="badge badge-status badge-online"><span class="status-indicator status-online"></span>Online</span>' 
                                         : '<span class="badge badge-status badge-offline"><span class="status-indicator status-offline"></span>Offline</span>';
            
            const lastLogin = user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleString() : 'Never';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.userName}</td>
                <td>${user.email}</td>
                <td>${status}</td>
                <td>${lastLogin}</td>
                <td>${user.totalSales || 0}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewUserSales('${user.uid}')">
                        <i class="fas fa-chart-line"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Load Medications with enhanced features
async function loadMedications() {
    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        medicationsData = [];
        const tbody = document.querySelector('#stockTable tbody');
        tbody.innerHTML = '';

        let totalItems = 0;
        let totalValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        medsSnapshot.forEach((doc) => {
            const med = { id: doc.id, ...doc.data() };
            medicationsData.push(med);
            totalItems++;

            // Calculate stock status
            let statusBadge = '';
            let statusClass = '';
            let stockStatus = 'ok';

            if (med.quantity === 0) {
                statusBadge = '<span class="badge badge-status badge-stock-out">Out of Stock</span>';
                statusClass = 'table-danger';
                stockStatus = 'out';
                outOfStockCount++;
            } else if (med.quantity <= med.minQuantity) {
                statusBadge = '<span class="badge badge-status badge-stock-critical">Critical</span>';
                statusClass = 'table-warning';
                stockStatus = 'critical';
                lowStockCount++;
            } else if (med.quantity <= med.minQuantity * 1.5) {
                statusBadge = '<span class="badge badge-status badge-stock-low">Low Stock</span>';
                statusClass = 'table-info';
                stockStatus = 'low';
                lowStockCount++;
            } else {
                statusBadge = '<span class="badge badge-status badge-stock-ok">In Stock</span>';
                statusClass = 'table-success';
                stockStatus = 'ok';
            }

            // Calculate total value
            const itemValue = med.quantity * med.price;
            totalValue += itemValue;

            const row = document.createElement('tr');
            row.className = statusClass;
            row.setAttribute('data-medication', med.name.toLowerCase());
            row.setAttribute('data-stock-status', stockStatus);

            row.innerHTML = `
                <td>
                    <strong>${med.name}</strong>
                    ${med.category ? `<br><small class="text-muted">${med.category}</small>` : ''}
                </td>
                <td>${med.dosage}</td>
                <td><strong>${med.quantity}</strong></td>
                <td>${med.minQuantity}</td>
                <td>${statusBadge}</td>
                <td>TSH ${med.price.toFixed(2)}</td>
                <td>TSH ${itemValue.toFixed(2)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-warning" onclick="editMedication('${med.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="adjustStock('${med.id}')" title="Adjust Stock">
                            <i class="fas fa-plus-minus"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteMedication('${med.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update overview cards
        document.getElementById('totalStockItems').textContent = totalItems;
        document.getElementById('totalStockValue').textContent = `TSH ${totalValue.toFixed(2)}`;
        document.getElementById('lowStockAlerts').textContent = lowStockCount;
        document.getElementById('outOfStockItems').textContent = outOfStockCount;

        // Update main dashboard stats
        document.getElementById('totalMedications').textContent = totalItems;

    } catch (error) {
        console.error("Error loading medications:", error);
    }
}

// Load All Registered Users
async function loadAllUsers() {
    try {
        const allUsers = await getAllUsers();
        let html = '<div style="color: rgba(255, 255, 255, 0.9);">';
        
        if (allUsers.length === 0) {
            html += '<p>No registered users found</p>';
        } else {
            allUsers.forEach(user => {
                const status = user.isOnline ? 'online' : 'offline';
                const statusText = user.isOnline ? 'Online' : 'Offline';
                const lastLogin = user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never';
                
                html += `
                    <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span class="status-indicator status-${status}"></span>
                                <strong>${user.userName}</strong> (${user.role || 'user'})
                                <br><small style="opacity: 0.7;">${user.email}</small>
                            </div>
                            <div style="text-align: right;">
                                <small style="opacity: 0.7;">Last Login: ${lastLogin}</small>
                                <br><small style="opacity: 0.7;">Sales: ${user.totalSales || 0}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        document.getElementById('allUsersDiv').innerHTML = html;
    } catch (error) {
        console.error("Error loading all users:", error);
    }
}

// Setup Form Handlers
function setupFormHandlers() {
    // ... existing code ...

    // Search and Filter functionality
    document.getElementById('searchStock').addEventListener('input', filterStockTable);
    document.getElementById('filterStockStatus').addEventListener('change', filterStockTable);

    // Download template
    document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);

    // Quick Actions
    document.getElementById('generateLowStockReport').addEventListener('click', generateLowStockReport);
    document.getElementById('exportInventory').addEventListener('click', exportInventory);
    document.getElementById('clearAllStock').addEventListener('click', clearAllStock);

    // ... existing code ...
}
    // Add Medication Form
    document.getElementById('addMedicationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('medName').value.trim();
        const dosage = document.getElementById('medDosage').value.trim();
        const quantity = parseInt(document.getElementById('medQuantity').value);
        const minQuantity = parseInt(document.getElementById('medMinQuantity').value);
        const price = parseFloat(document.getElementById('medPrice').value);
        const category = document.getElementById('medCategory').value;
        const description = document.getElementById('medDescription').value.trim();
        const btn = e.target.querySelector('button[type="submit"]');

        // Validation
        if (!name || !dosage || quantity < 0 || minQuantity < 1 || price < 0) {
            showAlert('Please fill all required fields with valid values', 'warning');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            const medData = {
                name,
                dosage,
                quantity,
                minQuantity,
                price,
                category,
                description,
                createdAt: new Date(),
                createdBy: currentUserID
            };
            await addDoc(collection(db, "medications"), medData);
            showAlert(`Medication "${name}" added successfully!`, 'success');
            e.target.reset();
            await loadMedications();
            await loadDashboardData();
            if (typeof loadInventoryStats === 'function') await loadInventoryStats();
        } catch (error) {
            showAlert('Error adding medication: ' + error.message, 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Add Medication';
        }

    // Utility: Refresh inventory stats for dashboard cards
    async function loadInventoryStats() {
        try {
            const medsSnapshot = await getDocs(collection(db, "medications"));
            let totalItems = 0;
            let totalValue = 0;
            let lowStockCount = 0;
            let outOfStockCount = 0;
            medsSnapshot.forEach((doc) => {
                const med = doc.data();
                totalItems++;
                if (med.quantity === 0) outOfStockCount++;
                if (med.quantity <= med.minQuantity) lowStockCount++;
                totalValue += (med.quantity * med.price);
            });
            if(document.getElementById('totalStockItems')) document.getElementById('totalStockItems').textContent = totalItems;
            if(document.getElementById('totalStockValue')) document.getElementById('totalStockValue').textContent = `TSH ${totalValue.toFixed(2)}`;
            if(document.getElementById('lowStockAlerts')) document.getElementById('lowStockAlerts').textContent = lowStockCount;
            if(document.getElementById('outOfStockItems')) document.getElementById('outOfStockItems').textContent = outOfStockCount;
        } catch (error) {
            console.error("Error loading inventory stats:", error);
        }
    }
    });

    // Create User Form
    document.getElementById('createUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userName = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        const role = document.getElementById('newUserRole').value;

        try {
            const result = await createNewUser(currentUserID, email, password, userName, role);
            if (result.success) {
                showAlert('User created successfully!', 'success');
                e.target.reset();
                await loadUsers();
                await loadAllUsers();
                await loadDashboardData();
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            showAlert('Error creating user: ' + error.message, 'danger');
        }
    });

    // Excel Upload Form
    document.getElementById('excelUploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = document.getElementById('excelFile').files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet);

                let successCount = 0;
                for (const row of data) {
                    await addDoc(collection(db, "medications"), {
                        name: row.Name,
                        dosage: row.Dosage,
                        quantity: parseInt(row.Quantity),
                        minQuantity: parseInt(row.MinQuantity),
                        price: parseFloat(row.Price),
                        description: row.Description || '',
                        createdAt: new Date(),
                        createdBy: currentUserID
                    });
                    successCount++;
                }

                showAlert(`Successfully uploaded ${successCount} medications!`, 'success');
                document.getElementById('excelFile').value = '';
                await loadMedications();
                await loadDashboardData();
            } catch (error) {
                showAlert('Error uploading Excel: ' + error.message, 'danger');
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Password toggle
    document.getElementById('toggleNewPass').addEventListener('click', function() {
        const input = document.getElementById('newUserPassword');
        const icon = this.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const logoutBtn = document.getElementById('logoutBtn');
        const originalText = logoutBtn.textContent;
        
        // Check network connectivity
        if (!navigator.onLine) {
            showAlert('No internet connection. Using offline logout.', 'warning');
            // Force logout without Firebase calls
            localStorage.removeItem('adminSettings');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }
        
        // Disable button and show loading state
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Logging out...';
        
        // Set a timeout for the logout operation
        const logoutTimeout = setTimeout(() => {
            console.warn('Logout timeout - forcing redirect');
            localStorage.removeItem('adminSettings');
            window.location.href = 'login.html';
        }, 10000); // 10 second timeout
        
        try {
            // First try the custom logout function
            const result = await logoutUser(currentUserID);
            clearTimeout(logoutTimeout);
            
            if (result.success) {
                // Clear local settings and redirect
                localStorage.removeItem('adminSettings');
                window.location.href = 'index.html';
            } else {
                // If custom logout fails, try direct Firebase signOut
                console.warn('Custom logout failed, trying direct signOut:', result.message);
                await auth.signOut();
                localStorage.removeItem('adminSettings');
                window.location.href = 'index.html';
            }
        } catch (error) {
            clearTimeout(logoutTimeout);
            console.error('Logout error:', error);
            
            // Final fallback - force redirect even if logout fails
            try {
                await auth.signOut();
            } catch (signOutError) {
                console.error('Direct signOut also failed:', signOutError);
            }
            
            localStorage.removeItem('adminSettings');
            window.location.href = 'index.html';
        }
    });

    // Force Logout (emergency logout)
    document.getElementById('forceLogoutBtn').addEventListener('click', () => {
        console.log('Force logout initiated');
        
        // Clear all local data
        localStorage.removeItem('adminSettings');
        localStorage.clear();
        
        // Force redirect to login (no Firebase calls)
        window.location.href = 'index.html';
    });

    // Profile Modal Handlers
    document.getElementById('profileModal').addEventListener('show.bs.modal', async () => {
        try {
            const userData = await getUserData(currentUserID);
            if (userData) {
                document.getElementById('profileDisplayName').value = userData.userName || '';
                document.getElementById('profileEmail').value = userData.email || '';
                document.getElementById('profileRole').value = 'Administrator';
                document.getElementById('profileCreatedAt').value = userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Unknown';
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    });

    // Save Profile
    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
        const displayName = document.getElementById('profileDisplayName').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            // Update display name
            if (displayName) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName
                });
                await updateDoc(doc(db, "users", currentUserID), {
                    userName: displayName
                });
                document.getElementById('adminName').textContent = displayName;
            }

            // Update password if provided
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    showProfileAlert('New passwords do not match', 'danger');
                    return;
                }
                if (!currentPassword) {
                    showProfileAlert('Please enter current password', 'danger');
                    return;
                }
                // Note: Password update would require re-authentication in a real implementation
                showProfileAlert('Password update requires re-authentication. Please logout and login again.', 'warning');
            }

            showProfileAlert('Profile updated successfully!', 'success');
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
            }, 1500);
        } catch (error) {
            showProfileAlert('Error updating profile: ' + error.message, 'danger');
        }
    });

    // Settings Modal Handlers
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        // Save settings to localStorage for demo purposes
        const settings = {
            theme: document.getElementById('themeSelect').value,
            language: document.getElementById('languageSelect').value,
            autoRefresh: document.getElementById('autoRefresh').checked,
            showWelcome: document.getElementById('showWelcome').checked,
            compactView: document.getElementById('compactView').checked,
            emailNewUser: document.getElementById('emailNewUser').checked,
            emailLowStock: document.getElementById('emailLowStock').checked,
            emailSales: document.getElementById('emailSales').checked,
            notifyErrors: document.getElementById('notifyErrors').checked,
            notifyBackup: document.getElementById('notifyBackup').checked,
            notifySecurity: document.getElementById('notifySecurity').checked,
            sessionTimeout: document.getElementById('sessionTimeout').value,
            twoFactor: document.getElementById('twoFactor').checked,
            ipWhitelist: document.getElementById('ipWhitelist').checked,
            maxLoginAttempts: document.getElementById('maxLoginAttempts').value
        };

        localStorage.setItem('adminSettings', JSON.stringify(settings));
        
        // Apply theme and language immediately
        applyTheme(settings.theme);
        applyLanguage(settings.language);
        
        // Show success message and close modal after a brief delay
        showSettingsAlert('Settings saved and applied successfully!', 'success');
        
        // Close modal after showing the success message
        setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
        }, 1500);
    });

    // Load settings on modal show
    document.getElementById('settingsModal').addEventListener('show.bs.modal', () => {
        const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        
        // Store original settings for preview/revert
        window.originalSettings = { ...settings };
        
        // General settings
        document.getElementById('themeSelect').value = settings.theme || 'default';
        document.getElementById('languageSelect').value = settings.language || 'en';
        document.getElementById('autoRefresh').checked = settings.autoRefresh !== false;
        document.getElementById('showWelcome').checked = settings.showWelcome !== false;
        document.getElementById('compactView').checked = settings.compactView || false;
        
        // Notifications
        document.getElementById('emailNewUser').checked = settings.emailNewUser !== false;
        document.getElementById('emailLowStock').checked = settings.emailLowStock !== false;
        document.getElementById('emailSales').checked = settings.emailSales !== false;
        document.getElementById('notifyErrors').checked = settings.notifyErrors !== false;
        document.getElementById('notifyBackup').checked = settings.notifyBackup !== false;
        document.getElementById('notifySecurity').checked = settings.notifySecurity || false;
        
        // Security
        document.getElementById('sessionTimeout').value = settings.sessionTimeout || '60';
        document.getElementById('twoFactor').checked = settings.twoFactor || false;
        document.getElementById('ipWhitelist').checked = settings.ipWhitelist || false;
        document.getElementById('maxLoginAttempts').value = settings.maxLoginAttempts || '5';
    });

    // Preview theme changes
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Preview language changes
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        applyLanguage(e.target.value);
    });

    // Revert changes if modal is closed without saving
    document.getElementById('settingsModal').addEventListener('hide.bs.modal', () => {
        if (window.originalSettings) {
            applyTheme(window.originalSettings.theme || 'default');
            applyLanguage(window.originalSettings.language || 'en');
        }
    });

    // Export buttons
    document.getElementById('exportUsers').addEventListener('click', () => {
        exportData('users', 'Users');
    });
    
    document.getElementById('exportInventory').addEventListener('click', () => {
        exportData('medications', 'Inventory');
    });
    
    document.getElementById('exportSales').addEventListener('click', () => {
        exportData('sales', 'Sales');
    });
    
    document.getElementById('exportAll').addEventListener('click', () => {
        exportAllData();
    });
}

// Show Profile Alert
function showProfileAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('profileAlertDiv');
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'check-circle'} me-1"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Show Settings Alert
function showSettingsAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('settingsAlertDiv');
    alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'danger' ? 'exclamation-circle' : 'check-circle'} me-1"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Export Data Function
async function exportData(collectionName, fileName) {
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        const data = [];
        
        snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        showSettingsAlert(`${fileName} data exported successfully!`, 'success');
    } catch (error) {
        showSettingsAlert('Error exporting data: ' + error.message, 'danger');
    }
}

// Export All Data
async function exportAllData() {
    try {
        const collections = ['users', 'medications', 'sales', 'contact_inquiries'];
        const workbook = XLSX.utils.book_new();
        
        for (const collectionName of collections) {
            const snapshot = await getDocs(collection(db, collectionName));
            const data = [];
            
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, collectionName);
        }
        
        XLSX.writeFile(workbook, `FPOP_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
        showSettingsAlert('Complete backup exported successfully!', 'success');
    } catch (error) {
        showSettingsAlert('Error creating backup: ' + error.message, 'danger');
    }
}

// Global functions
window.editMedication = async (id) => {
    const med = medicationsData.find(m => m.id === id);
    if (med) {
        const newQuantity = prompt(`Update quantity for ${med.name}:`, med.quantity);
        if (newQuantity !== null) {
            try {
                await updateDoc(doc(db, "medications", id), {
                    quantity: parseInt(newQuantity)
                });
                showAlert('Medication updated!', 'success');
                await loadMedications();
                await loadDashboardData();
            } catch (error) {
                showAlert('Error updating medication: ' + error.message, 'danger');
            }
        }
    }
};

window.deleteMedication = async (id) => {
    if (confirm('Are you sure you want to delete this medication?')) {
        try {
            await deleteDoc(doc(db, "medications", id));
            showAlert('Medication deleted!', 'success');
            await loadMedications();
            await loadDashboardData();
        } catch (error) {
            showAlert('Error deleting medication: ' + error.message, 'danger');
        }
    }
};

window.viewUserSales = (uid) => {
    const user = usersData.find(u => u.uid === uid);
    if (user) {
        alert(`Sales for ${user.userName}:\nTotal Sales: ${user.totalSales || 0}\n\nUse the sales report tab for detailed information.`);
    }
};

// Load Customer Inquiries
async function loadInquiries() {
    try {
        const inquiriesSnapshot = await getDocs(collection(db, "contact_inquiries"));
        const tbody = document.querySelector('#inquiriesTable tbody');
        tbody.innerHTML = '';

        inquiriesSnapshot.forEach((doc) => {
            const inquiry = { id: doc.id, ...doc.data() };
            const submittedDate = new Date(inquiry.submittedAt.toDate()).toLocaleString();
            
            let statusBadge = '';
            switch(inquiry.status) {
                case 'new':
                    statusBadge = '<span class="badge badge-status" style="background: rgba(52, 152, 219, 0.3); color: #3498db; border: 1px solid #3498db;">New</span>';
                    break;
                case 'in-progress':
                    statusBadge = '<span class="badge badge-status" style="background: rgba(243, 156, 18, 0.3); color: #f39c12; border: 1px solid #f39c12;">In Progress</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="badge badge-status" style="background: rgba(39, 174, 96, 0.3); color: #2ecc71; border: 1px solid #2ecc71;">Completed</span>';
                    break;
                default:
                    statusBadge = '<span class="badge badge-status badge-offline">Unknown</span>';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${submittedDate}</td>
                <td>${inquiry.name}</td>
                <td>${inquiry.company || 'N/A'}</td>
                <td>${inquiry.email}</td>
                <td>${inquiry.subject}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewInquiry('${inquiry.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="updateInquiryStatus('${inquiry.id}', 'in-progress')">
                        <i class="fas fa-clock"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="updateInquiryStatus('${inquiry.id}', 'completed')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading inquiries:", error);
    }
}

// Global functions for inquiries
window.viewInquiry = async (id) => {
    try {
        const inquiryDoc = await getDoc(doc(db, "contact_inquiries", id));
        if (inquiryDoc.exists()) {
            const inquiry = inquiryDoc.data();
            const submittedDate = new Date(inquiry.submittedAt.toDate()).toLocaleString();
            
            const modalBody = document.getElementById('inquiryModalBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6><strong>Name:</strong></h6>
                        <p>${inquiry.name}</p>
                        
                        <h6><strong>Email:</strong></h6>
                        <p><a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
                        
                        <h6><strong>Company:</strong></h6>
                        <p>${inquiry.company || 'N/A'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6><strong>Subject:</strong></h6>
                        <p>${inquiry.subject}</p>
                        
                        <h6><strong>Status:</strong></h6>
                        <p>${inquiry.status}</p>
                        
                        <h6><strong>Submitted:</strong></h6>
                        <p>${submittedDate}</p>
                    </div>
                </div>
                <hr>
                <h6><strong>Message:</strong></h6>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
                    ${inquiry.message.replace(/\n/g, '<br>')}
                </div>
            `;
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('inquiryModal'));
            modal.show();
        }
    } catch (error) {
        console.error("Error viewing inquiry:", error);
        showAlert('Error loading inquiry details', 'danger');
    }
};

window.updateInquiryStatus = async (id, status) => {
    try {
        await updateDoc(doc(db, "contact_inquiries", id), {
            status: status
        });
        showAlert(`Inquiry status updated to ${status}`, 'success');
        await loadInquiries();
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        showAlert('Error updating inquiry status', 'danger');
    }
};

// Filter Stock Table
function filterStockTable() {
    const searchTerm = document.getElementById('searchStock').value.toLowerCase();
    const statusFilter = document.getElementById('filterStockStatus').value;
    const rows = document.querySelectorAll('#stockTable tbody tr');

    rows.forEach(row => {
        const medName = row.getAttribute('data-medication');
        const stockStatus = row.getAttribute('data-stock-status');

        const matchesSearch = medName.includes(searchTerm);
        const matchesFilter = statusFilter === 'all' || stockStatus === statusFilter;

        row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
}

// Download Excel Template
function downloadTemplate() {
    const templateData = [
        {
            Name: 'Aspirin',
            Dosage: '500mg',
            Quantity: 100,
            MinQuantity: 20,
            Price: 5.99,
            Description: 'Pain relief medication',
            Category: 'pain'
        },
        {
            Name: 'Amoxicillin',
            Dosage: '250mg',
            Quantity: 50,
            MinQuantity: 10,
            Price: 12.50,
            Description: 'Antibiotic medication',
            Category: 'antibiotic'
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'medication_template.xlsx');

    showAlert('Template downloaded! Fill it with your medication data and upload.', 'success');
}

// Generate Low Stock Report
async function generateLowStockReport() {
    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        const lowStockMeds = [];

        medsSnapshot.forEach((doc) => {
            const med = doc.data();
            if (med.quantity <= med.minQuantity) {
                lowStockMeds.push({
                    Name: med.name,
                    Dosage: med.dosage,
                    Current_Stock: med.quantity,
                    Minimum_Required: med.minQuantity,
                    Status: med.quantity === 0 ? 'Out of Stock' : 'Low Stock',
                    Price: med.price
                });
            }
        });

        if (lowStockMeds.length === 0) {
            showAlert('No medications are currently low on stock!', 'info');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(lowStockMeds);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Low Stock Report');
        XLSX.writeFile(workbook, `low_stock_report_${new Date().toISOString().split('T')[0]}.xlsx`);

        showAlert(`Low stock report generated with ${lowStockMeds.length} items!`, 'warning');
    } catch (error) {
        showAlert('Error generating report: ' + error.message, 'danger');
    }
}

// Export Inventory
async function exportInventory() {
    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        const inventoryData = [];

        medsSnapshot.forEach((doc) => {
            const med = doc.data();
            inventoryData.push({
                Name: med.name,
                Dosage: med.dosage,
                Quantity: med.quantity,
                Min_Quantity: med.minQuantity,
                Price: med.price,
                Total_Value: (med.quantity * med.price).toFixed(2),
                Category: med.category || 'general',
                Description: med.description || '',
                Status: med.quantity === 0 ? 'Out of Stock' :
                       med.quantity <= med.minQuantity ? 'Low Stock' : 'In Stock'
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(inventoryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
        XLSX.writeFile(workbook, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);

        showAlert('Inventory exported successfully!', 'success');
    } catch (error) {
        showAlert('Error exporting inventory: ' + error.message, 'danger');
    }
}

// Clear All Stock (Dangerous operation)
async function clearAllStock() {
    const confirmText = prompt('This will delete ALL medications from inventory. Type "DELETE ALL" to confirm:');

    if (confirmText !== 'DELETE ALL') {
        showAlert('Operation cancelled.', 'info');
        return;
    }

    try {
        const medsSnapshot = await getDocs(collection(db, "medications"));
        const deletePromises = [];

        medsSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);

        showAlert(`Deleted ${deletePromises.length} medications from inventory!`, 'danger');
        await loadMedications();
        await loadDashboardData();
    } catch (error) {
        showAlert('Error clearing inventory: ' + error.message, 'danger');
    }
}

// Adjust Stock Quantity
window.adjustStock = async (id) => {
    const med = medicationsData.find(m => m.id === id);
    if (!med) return;

    const adjustment = prompt(`Adjust stock for "${med.name}"\nCurrent: ${med.quantity}\n\nEnter new quantity or use +10/-5 format:`, med.quantity);

    if (adjustment === null) return;

    let newQuantity;
    if (adjustment.startsWith('+') || adjustment.startsWith('-')) {
        const change = parseInt(adjustment);
        newQuantity = med.quantity + change;
    } else {
        newQuantity = parseInt(adjustment);
    }

    if (isNaN(newQuantity) || newQuantity < 0) {
        showAlert('Invalid quantity entered.', 'warning');
        return;
    }

    try {
        await updateDoc(doc(db, "medications", id), {
            quantity: newQuantity
        });
        showAlert(`Stock updated: ${med.name} (${med.quantity} → ${newQuantity})`, 'success');
        await loadMedications();
        await loadDashboardData();
    } catch (error) {
        showAlert('Error updating stock: ' + error.message, 'danger');
    }
};
