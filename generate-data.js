const fs = require('fs');
const path = require('path');

// Función para generar un ID único simple (puedes usar una librería más robusta si necesitas IDs más complejos)
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 9);
}

// Función para obtener el tipo de archivo (imagen, video, pdf, powerpoint)
function getFileType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.jfif'].includes(ext)) {
        return 'image';
    } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
        return 'video';
    } else if (['.pdf'].includes(ext)) { // Añadido para PDF
        return 'pdf';
    } else if (['.pptx', '.ppt'].includes(ext)) { // Añadido para PowerPoint
        return 'powerpoint';
    }
    return 'unknown';
}

// Directorio base donde se encuentran las categorías
const baseDir = './galeria'; 
console.log(`DEBUG: baseDir configurado a: ${baseDir}`); // DEBUG

// Estructura de datos para el JSON
const data = [];

// Definir las categorías y sus propiedades
const categoriesConfig = [
    {
        name: 'OFERTAS-ESPECIALES', // Asegúrate de que la carpeta exista con este nombre exacto
        isProductCategory: false,
        subdirectories: [],
        contentMap: {
            'pack_iconos.png': 'Pack de Iconos Digitales',
            'plantilla_redes.jpg': 'Plantilla para Redes Sociales'
        }
    },
    {
        name: 'Promociones',
        isProductCategory: true,
        products: [
            {
                id: 'promo_bolsa_001',
                name: 'Bolsa de Friselina',
                price: 1200,
                description: 'Promoción de bolsa de friselina personalizada con un lápiz.',
                images: [
                    {
                        id: '136yzu1',
                        name: 'bolsadefriselina',
                        type: 'image',
                        src: 'Promociones/bolsadefriselina.jfif'
                    }
                ],
                path: 'Promociones/bolsas'
            },
            {
                id: 'promo_mate_001',
                name: 'Mate Sublimado',
                price: 2500,
                description: 'Promoción de mate de cerámica sublimado con bombilla.',
                images: [
                    {
                        id: '13gyipv',
                        name: 'matesdeceramicasublimados',
                        type: 'image',
                        src: 'Promociones/matesdeceramicasublimados.jfif'
                    }
                ],
                path: 'Promociones/mates'
            }
        ]
    },
    {
        name: 'Servicios-Digitales', // *** CAMBIO AQUÍ: Ahora coincide con tu nombre de carpeta con guion ***
        isProductCategory: false,
        subdirectories: ['pdf', 'powerpoint'],
        contentMap: {}
    },
    {
        name: 'tienda-productos',
        isProductCategory: true,
        subdirectories: []
    }
];

categoriesConfig.forEach(categoryConfig => {
    console.log(`DEBUG: Procesando categoría: ${categoryConfig.name}`); // DEBUG
    const categoryEntry = {
        name: categoryConfig.name,
        path: categoryConfig.name,
        isProductCategory: categoryConfig.isProductCategory
    };

    const categoryFolderPath = path.join(baseDir, categoryConfig.name);
    console.log(`DEBUG: Ruta de la categoría: ${categoryFolderPath}`); // DEBUG

    if (categoryConfig.isProductCategory) {
        if (categoryConfig.products) {
            categoryEntry.products = categoryConfig.products;
        } else {
            categoryEntry.products = [];
            if (fs.existsSync(categoryFolderPath)) {
                const subfolders = fs.readdirSync(categoryFolderPath, { withFileTypes: true })
                                   .filter(dirent => dirent.isDirectory())
                                   .map(dirent => dirent.name);
                console.log(`DEBUG: Subcarpetas encontradas en ${categoryFolderPath}: ${subfolders.join(', ')}`); // DEBUG

                subfolders.forEach(subfolderName => {
                    const subfolderPath = path.join(categoryFolderPath, subfolderName);
                    if (fs.existsSync(subfolderPath)) { // Asegurarse de que la subcarpeta existe
                        const files = fs.readdirSync(subfolderPath);
                        console.log(`DEBUG: Archivos encontrados en ${subfolderPath}: ${files.join(', ')}`); // DEBUG
                        files.forEach(file => {
                            const filePath = path.join(subfolderPath, file);
                            const fileStat = fs.statSync(filePath);
                            if (fileStat.isFile()) {
                                const fileName = path.basename(file);
                                const fileType = getFileType(fileName);
                                if (fileType === 'image') {
                                    categoryEntry.products.push({
                                        id: generateUniqueId(),
                                        name: subfolderName.replace(/-/g, ' '),
                                        price: 0,
                                        description: `Descripción detallada de ${subfolderName.replace(/-/g, ' ')}.`,
                                        images: [{
                                            id: generateUniqueId(),
                                            name: fileName.split('.')[0],
                                            type: 'image',
                                            src: path.join(categoryConfig.name, subfolderName, fileName).replace(/\\/g, '/')
                                        }],
                                        path: path.join(categoryConfig.name, subfolderName).replace(/\\/g, '/')
                                    });
                                    console.log(`DEBUG: Añadido producto: ${fileName} (${fileType})`); // DEBUG
                                }
                            }
                        });
                    } else {
                        console.warn(`WARN: Subcarpeta no encontrada: ${subfolderPath}`); // DEBUG
                    }
                });
            } else {
                console.warn(`WARN: Carpeta de categoría de producto no encontrada: ${categoryFolderPath}`); // DEBUG
            }
        }
    } else {
        categoryEntry.content = [];
        if (categoryConfig.subdirectories && categoryConfig.subdirectories.length > 0) {
            console.log(`DEBUG: Categoría con subdirectorios: ${categoryConfig.name}, subdirs: ${categoryConfig.subdirectories.join(', ')}`); // DEBUG
            categoryConfig.subdirectories.forEach(subdirname => {
                const subDirPath = path.join(categoryFolderPath, subdirname);
                console.log(`DEBUG: Intentando leer subdirectorio: ${subDirPath}`); // DEBUG
                if (fs.existsSync(subDirPath)) {
                    const files = fs.readdirSync(subDirPath);
                    console.log(`DEBUG: Archivos encontrados en ${subDirPath}: ${files.join(', ')}`); // DEBUG
                    files.forEach(file => {
                        const filePath = path.join(subDirPath, file);
                        const fileStat = fs.statSync(filePath);
                        if (fileStat.isFile()) {
                            const fileName = path.basename(file);
                            const fileType = getFileType(fileName);
                            const contentName = fileName.split('.')[0].replace(/-/g, ' ');
                            categoryEntry.content.push({
                                id: generateUniqueId(),
                                name: contentName,
                                type: fileType,
                                src: path.join(categoryConfig.name, subdirname, fileName).replace(/\\/g, '/'),
                                eventName: categoryConfig.name,
                                price: 0,
                                description: `Descripción detallada de ${contentName}.`
                            });
                            console.log(`DEBUG: Añadido servicio digital: ${fileName} (Tipo: ${fileType})`); // DEBUG
                        }
                    });
                } else {
                    console.warn(`WARN: Subdirectorio de servicio digital no encontrado: ${subDirPath}`); // DEBUG
                }
            });
        } else {
            console.log(`DEBUG: Categoría sin subdirectorios: ${categoryConfig.name}`); // DEBUG
            if (fs.existsSync(categoryFolderPath)) {
                const files = fs.readdirSync(categoryFolderPath);
                console.log(`DEBUG: Archivos encontrados en ${categoryFolderPath}: ${files.join(', ')}`); // DEBUG
                files.forEach(file => {
                    const filePath = path.join(categoryFolderPath, file);
                    const fileStat = fs.statSync(filePath);
                    if (fileStat.isFile()) {
                        const fileName = path.basename(file);
                        const fileType = getFileType(fileName);
                        const contentName = categoryConfig.contentMap[fileName] || fileName.split('.')[0];
                        categoryEntry.content.push({
                            id: generateUniqueId(),
                            name: contentName,
                            type: fileType,
                            src: path.join(categoryConfig.name, fileName).replace(/\\/g, '/'),
                            eventName: categoryConfig.name,
                            price: 0,
                            description: `Descripción detallada de ${contentName}.`
                        });
                        console.log(`DEBUG: Añadido ítem directo: ${fileName} (Tipo: ${fileType})`); // DEBUG
                    }
                });
            } else {
                console.warn(`WARN: Carpeta de categoría directa no encontrada: ${categoryFolderPath}`); // DEBUG
            }
        }
    }
    data.push(categoryEntry);
});

// Escribir el archivo data.json
fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');

console.log('data.json generado exitosamente.');
