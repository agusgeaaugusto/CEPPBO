/**
 * CEPPBO - API de imágenes desde Google Drive
 * 1) Creá una carpeta principal en Drive.
 * 2) Dentro creá EXACTAMENTE estas carpetas:
 *    01 - Avisos
 *    02 - Posters
 *    03 - Logos
 *    04 - Actividades
 *    05 - Eventos
 *    06 - Horarios
 *    07 - Grados y Cursos
 *    08 - Docentes
 * 3) Copiá el ID de la carpeta principal abajo.
 * 4) Implementar > Nueva implementación > Aplicación web.
 *    Ejecutar como: vos. Acceso: Cualquier persona.
 * 5) Copiá la URL terminada en /exec a media-config.js.
 */
const ROOT_FOLDER_ID = '1YNht6JgzPFKGvls-ZpX2fqQb0fYFXqgh';
const FOLDERS = {
  avisos: '01_AVISOS',
  posters: '02_POSTERS',
  logos: '03_LOGOS',
  actividades: '04_ACTIVIDADES',
  eventos: '05_EVENTOS',
  horarios: '06_HORARIOS',
  grados_cursos: '07_GRADOS_Y_CURSOS',
  docentes: '08_DOCENTES',
  fondo_portada: '09_FONDO_PORTADA'
};

function doGet() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const sections = {};
  Object.keys(FOLDERS).forEach(key => sections[key] = readFolder_(root, FOLDERS[key]));
  return ContentService.createTextOutput(JSON.stringify({ok:true, updatedAt:new Date().toISOString(), sections}))
    .setMimeType(ContentService.MimeType.JSON);
}

function readFolder_(root, folderName) {
  const folders = root.getFoldersByName(folderName);
  if (!folders.hasNext()) return [];
  const files = folders.next().getFiles();
  const out = [];
  while (files.hasNext()) {
    const f = files.next();
    if (!String(f.getMimeType()).startsWith('image/')) continue;
    const id = f.getId();
    out.push({
      id,
      name: f.getName(),
      mimeType: f.getMimeType(),
      modifiedTime: f.getLastUpdated().toISOString(),
      imageUrl: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1600'
    });
  }
  out.sort((a,b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
  return out;
}
