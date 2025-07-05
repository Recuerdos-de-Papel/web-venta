document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración Global ---
    const CONFIG = {
        WHATSAPP_NUMBER: '5493518187831', // ¡NUEVO NÚMERO DE WHATSAPP!
        PRICE_LOCALE: 'es-AR',
        CURRENCY: 'ARS',
        ITEMS_PER_PAGE: 72,

        // Alias de Mercado Pago
        MERCADO_PAGO_ALIAS: 'Recuerdos.de.papel' // Alias de Mercado Pago actualizado
    };

    // Función para guardar la selección en localStorage
    function saveSelectionToLocalStorage() {
        // Convertir el Map a un Array de pares [key, value] para guardar
        const selectedItemsArray = Array.from(selectedItems.entries());
        localStorage.setItem('selectedItems', JSON.stringify(selectedItemsArray));
        console.log("DEBUG: Selección guardada en localStorage.");
    }

    // Función para cargar la selección de localStorage al inicio
    function loadSelectionFromLocalStorage() {
        const savedItems = localStorage.getItem('selectedItems');
        if (savedItems) {
            try {
                // Convertir el Array de pares [key, value] de nuevo a un Map
                selectedItems = new Map(JSON.parse(savedItems));
                console.log("DEBUG: Selección cargada de localStorage.", selectedItems);
            } catch (e) {
                console.error("ERROR: Fallo al parsear la selección de localStorage. Iniciando con carrito vacío.", e);
                selectedItems = new Map();
            }
        } else {
            selectedItems = new Map();
            console.log("DEBUG: No hay selección guardada en localStorage. Iniciando con carrito vacío.");
        }
    }

    // --- Nuevas variables globales para una mejor organización de datos ---
    let downloadableServices = []; // Contiene todos los ítems que son verdaderamente descargables (Servicios Digitales, OFERTAS-ESPECIALES)
    let digitalServicesOnly = []; // Contiene solo los ítems de la categoría "Servicios Digitales" (PDFs, PowerPoints, etc.)
    let storeProducts = [];        // Contiene solo los productos físicos de la categoría "tienda-productos" y "Promociones"
    let featuredOffers = [];       // Contiene los ítems para la sección de "Promociones Destacadas" (OFERTAS-ESPECIALES y Promociones)

    let currentLightboxItems = [];  // Los ítems (imágenes de promociones o imágenes de productos) actualmente vistos en el lightbox
    let currentPhotoIndex = 0;      // Índice del ítem actual en el lightbox
    let currentLightboxContext = ''; // 'photo' (para promociones destacadas/servicios digitales) o 'product' (para productos de tienda).

    // *** Para la Sección de Descarga del Cliente ***
    let clientDownloadPhotos = []; // Almacena los ítems para mostrar en la sección de descarga
    let lastGeneratedDownloadLink = ''; // Para almacenar el enlace generado por el admin para copiar/whatsapp fácilmente

    // *** MAPA ÚNICO PARA EL CARRITO ***
    // La clave es el ID del ítem (prefijado con 'photo_' o 'product_')
    // Para productos, la clave será 'product_PARENT_PRODUCT_ID_IMAGE_ID' para diferenciar variantes.
    // El valor es un objeto { originalId: string, type: string, quantity: number, itemData: object, selectedImage?: object }
    let selectedItems = new Map(); // Se inicializa aquí, luego se carga de localStorage

    // --- Referencias a Elementos del DOM ---
    const elements = {
        // Secciones de Contenido Principal (para handleRouting)
        mainContent: document.getElementById('main-content'), // Contenedor para todas las secciones primarias

        // Encabezado y Navegación
        header: document.querySelector('.header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mobileMenu: document.querySelector('.mobile-menu'),
        closeMenuBtn: document.querySelector('.close-menu-btn'),
        mobileNavLinks: document.querySelectorAll('.mobile-nav-list a'),
        navLinks: document.querySelectorAll('.nav-list a'),

        // Secciones Principales
        heroSection: document.getElementById('hero'),
        eventsContainer: document.getElementById('featured-events-container'), // Ahora es para "promociones destacadas"
        featuredProductsGrid: document.getElementById('featuredProductsGrid'),
        servicesSection: document.getElementById('services'), // Referencia a la sección de servicios
        digitalServicesGrid: document.getElementById('digital-services-grid'), // NUEVO: Contenedor para servicios digitales
        productsSection: document.getElementById('products'),   // Referencia a la sección de productos
        contactSection: document.getElementById('contact'),     // Referencia a la sección de contacto
        aboutSection: document.getElementById('about'), // Referencia a la sección "Quiénes Somos"

        // Pie de página
        footer: document.querySelector('footer'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightbox-image'),
        lightboxVideo: document.getElementById('lightbox-video'),
        lightboxCaption: document.getElementById('lightbox-caption'),
        lightboxClose: document.getElementById('lightbox-close'),
        lightboxPrev: document.getElementById('lightbox-prev'),
        lightboxNext: document.getElementById('lightbox-next'),
        addToSelectionBtn: document.getElementById('addToSelectionBtn'),
        lightboxContent: null, // Se inicializará en init()
        lightboxFileIcon: null, // Se creará dinámicamente
        lightboxFileName: null, // Se creará dinámicamente

        // Panel de Selección (Carrito)
        selectionIcon: document.querySelector('.selection-icon'),
        selectionCount: document.querySelector('.selection-count'),
        selectionPanel: document.getElementById('selection-panel'),
        closeSelectionPanelBtn: document.getElementById('close-selection-panel-btn'),
        selectedItemsList: document.getElementById('selected-items-list'),
        totalPriceDisplay: document.getElementById('total-price'),
        clearSelectionBtn: document.getElementById('clear-selection-btn'),
        whatsappBtn: document.getElementById('whatsapp-btn'),
        packSummaryMessage: document.getElementById('pack-summary-message'),
        whatsappDownloadLinkBtn: document.getElementById('whatsapp-download-link-btn'), // Se mantiene oculto en HTML
        downloadLinkGeneratorBtn: document.getElementById('download-link-generator-btn'), // Se mantiene oculto en HTML

        // Modal de Pago
        paymentModal: document.getElementById('payment-modal'),
        closePaymentModalBtn: document.getElementById('close-payment-modal-btn'),
        paymentTotalAmount: document.getElementById('payment-total-amount'),
        // paymentTotalAmountTransfer: document.getElementById('payment-total-amount-transfer'), // Eliminado
        whatsappPaymentBtn: document.getElementById('whatsapp-payment-btn'),
        // paymentMethodToggle: document.getElementById('payment-method-toggle'), // Eliminado
        mercadoPagoDetails: document.getElementById('mercado-pago-details'),
        // bankTransferDetails: document.getElementById('bank-transfer-details'), // Eliminado
        mpAliasDisplay: document.getElementById('mp-alias-display'), // Nuevo: para mostrar el alias de MP
        // bankAliasDisplay: document.getElementById('bank-alias-display'), // Eliminado

        // Notificaciones Toast
        toastNotification: document.getElementById('toastNotification'),

        // Botón Flotante de WhatsApp
        whatsappFloatBtn: document.getElementById('whatsapp-float-btn'),

        // Sección de Descarga (NUEVO)
        downloadSection: document.getElementById('download-section'),
        downloadSectionTitle: document.querySelector('#download-section .section-title'), // Direct reference to the title
        downloadSubtitle: document.getElementById('downloadSubtitle'), // Subtítulo de la sección de descarga
        thankYouMessageDisplay: document.getElementById('thankYouMessageDisplay'), // Mensaje de agradecimiento
        downloadableContentWrapper: document.getElementById('downloadable-content-wrapper'), // Contenedor de elementos descargables
        downloadAllBtn: document.getElementById('download-all-btn'),
        downloadLinksContainer: document.getElementById('download-links-container'),


        // Panel de Administración (NUEVOS elementos para Generación de Enlaces de Descarga y Precios)
        adminPanel: document.getElementById('admin-panel'),
        openAdminPanelBtn: document.getElementById('open-admin-panel-btn'), 
        closeAdminPanelBtn: document.getElementById('close-admin-panel-btn'),
        
        // Mensaje compartido para actualizaciones de precios
        priceUpdateMessage: document.getElementById('price-update-message'), 

        // Sección de Precios de Promociones Destacadas
        featuredPromotionSelect: document.getElementById('featured-promotion-select'),
        selectedFeaturedPromotionPriceInputContainer: document.getElementById('selected-featured-promotion-price-input-container'),
        saveFeaturedPromotionPriceBtn: document.getElementById('save-featured-promotion-price-btn'),

        // Sección de Precios de Productos de Tienda
        storeProductSelect: document.getElementById('store-product-select'),
        selectedStoreProductPriceInputContainer: document.getElementById('selected-store-product-price-input-container'),
        saveStoreProductPricesBtn: document.getElementById('save-store-product-prices-btn'),
        
        // Sección de Precios de Servicios Digitales
        digitalServiceSelect: document.getElementById('digital-service-select'),
        selectedDigitalServicePriceInputContainer: document.getElementById('selected-digital-service-price-input-container'),
        saveDigitalServicePriceBtn: document.getElementById('save-digital-service-price-btn'),

        // Panel de Administración: Generar Enlace de Descarga por IDs
        adminPhotoIdsInput: document.getElementById('admin-photo-ids-input'),
        generateAdminDownloadLinkBtn: document.getElementById('generate-admin-download-link-btn'),
        generatedDownloadLinkOutput: document.getElementById('generated-download-link-output'),
        copyAdminDownloadLinkBtn: document.getElementById('copy-admin-download-link-btn'),
        whatsappAdminDownloadLinkBtn: document.getElementById('whatsapp-admin-download-link-btn'),
        // Referencia directa al encabezado 'Generar Enlace de Descarga por IDs' usando su ID
        adminGenerateIdsSectionHeader: document.getElementById('admin-generate-link-header')
    };

    // --- Funciones de Utilidad y Marketing Digital ---

    /**
     * Muestra una notificación temporal (toast).
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - Tipo de mensaje ('success', 'error', 'info', 'warn').
     */
    function showToast(message, type = 'info') {
        console.log(`DEBUG: showToast llamado con mensaje: "${message}", tipo: "${type}"`);
        if (!elements.toastNotification) {
            console.error("ERROR: No se encontró el elemento de notificación Toast!");
            return;
        }
        elements.toastNotification.textContent = message;
        elements.toastNotification.className = `toast ${type} show`;
        setTimeout(() => {
            elements.toastNotification.classList.remove('show');
        }, 3000);
    }

    /**
     * Formatea un número a un formato de moneda local.
     * @param {number} amount - La cantidad a formatear.
     * @returns {string} - La cantidad formateada como moneda.
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat(CONFIG.PRICE_LOCALE, {
            style: 'currency',
            currency: CONFIG.CURRENCY,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Calcula el precio total de la selección de ítems en el carrito.
     * @returns {{total: number, photoCount: number}} El precio total y el recuento de ítems de tipo 'photo'.
     */
    function calculateTotalPrice() {
        let total = 0;
        let photoCount = 0; // Se mantiene para contar ítems de tipo 'photo'.

        selectedItems.forEach(itemInCart => {
            let currentPrice = itemInCart.itemData.price; 
            if (itemInCart.type === 'photo') {
                const updatedItem = downloadableServices.find(ds => ds.id === itemInCart.originalId);
                if (updatedItem) {
                    currentPrice = updatedItem.price;
                    itemInCart.itemData.price = currentPrice; // Actualizar el precio en el objeto del carrito
                    // console.log(`DEBUG: calculateTotalPrice - Photo: ${itemInCart.itemData.name}, Original ID: ${itemInCart.originalId}, Updated Price: ${currentPrice}`); // DEBUG
                }
                photoCount += itemInCart.quantity;
                total += currentPrice * itemInCart.quantity;
            } else if (itemInCart.type === 'product') {
                const updatedProduct = storeProducts.find(p => p.id === itemInCart.originalId); 
                if (updatedProduct) {
                    currentPrice = updatedProduct.price;
                    itemInCart.itemData.price = currentPrice; // Actualizar el precio en el objeto del carrito
                    // console.log(`DEBUG: calculateTotalPrice - Product: ${itemInCart.itemData.name}, Original ID: ${itemInCart.originalId}, Updated Price: ${currentPrice}`); // DEBUG
                } else {
                    console.warn(`WARN: calculateTotalPrice - Producto no encontrado en storeProducts para ID: ${itemInCart.originalId}. Usando precio original del carrito.`); // DEBUG
                }
                total += currentPrice * itemInCart.quantity;
            }
        });
        // console.log(`DEBUG: calculateTotalPrice - Total calculado: ${total}, Photo Count: ${photoCount}`); // DEBUG
        return { total, photoCount };
    }

    /**
     * Actualiza la interfaz de usuario del carrito (recuento de ítems, precio total y lista de ítems).
     */
    function updateSelectionUI() {
        let totalItemsInCart = 0;
        selectedItems.forEach(item => {
            totalItemsInCart += item.quantity;
        });

        if (elements.selectionCount) elements.selectionCount.textContent = totalItemsInCart;

        if (elements.selectionIcon) {
            elements.selectionIcon.style.display = totalItemsInCart > 0 ? 'block' : 'none';
            // console.log(`DEBUG: selectionIcon display: ${elements.selectionIcon.style.display}`);
        }

        const { total, photoCount } = calculateTotalPrice();

        if (elements.totalPriceDisplay) elements.totalPriceDisplay.textContent = `Total Estimado: ${formatCurrency(total)}`;
        
        if (elements.paymentTotalAmount) elements.paymentTotalAmount.textContent = formatCurrency(total);
        // if (elements.paymentTotalAmountTransfer) elements.paymentTotalAmountTransfer.textContent = formatCurrency(total); // Eliminado
        
        renderSelectedItemsInCart();

        updateGridButtonsState();
    }

    /**
     * Actualiza el estado visual (texto, deshabilitado, clase 'selected') de los botones en las tarjetas de galería y productos.
     */
    function updateGridButtonsState() {
        // Para ítems en la sección de "Promociones Destacadas" (incluye servicios digitales de OFERTAS-ESPECIALES y productos de Promociones)
        document.querySelectorAll('#featured-events-container .photo-card').forEach(card => {
            const id = card.dataset.id;
            const mapKey = 'photo_' + id; 
            const addToCartBtn = card.querySelector('.select-button');

            let itemInCart = selectedItems.get(mapKey); // Check for 'photo_' type in cart

            if (itemInCart && itemInCart.quantity > 0) {
                card.classList.add('selected');
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${itemInCart.quantity})`;
                    addToCartBtn.disabled = false;
                }
            } else {
                card.classList.remove('selected');
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                    addToCartBtn.disabled = false;
                }
            }
        });

        // Para ítems en la nueva sección de "Servicios Digitales" (PDFs, PPTs, etc.)
        document.querySelectorAll('#digital-services-grid .photo-card').forEach(card => {
            const id = card.dataset.id;
            const mapKey = 'photo_' + id; 
            const addToCartBtn = card.querySelector('.select-button');

            let itemInCart = selectedItems.get(mapKey); // Check for 'photo_' type in cart

            if (itemInCart && itemInCart.quantity > 0) {
                card.classList.add('selected');
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${itemInCart.quantity})`;
                    addToCartBtn.disabled = false;
                }
            } else {
                card.classList.remove('selected');
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                    addToCartBtn.disabled = false;
                }
            }
        });


        // Para "productos" de la sección de la tienda
        document.querySelectorAll('.product-card').forEach(card => {
            const id = card.dataset.id;
            // Verificar si CUALQUIERA de las variantes de este producto está en el carrito para la clase 'selected'
            const productHasAnyVariantInCart = Array.from(selectedItems.keys()).some(key => key.startsWith(`product_${id}_`));
            const addToCartBtn = card.querySelector('.add-to-cart-btn');

            if (productHasAnyVariantInCart) {
                card.classList.add('selected');
                if (addToCartBtn) {
                     let totalProductQuantity = 0;
                     selectedItems.forEach(itemInCart => {
                         if (itemInCart.type === 'product' && itemInCart.originalId === id) {
                             totalProductQuantity += itemInCart.quantity;
                         }
                     });

                     addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${totalProductQuantity})`;
                     addToCartBtn.disabled = false;
                }
            } else {
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                    addToCartBtn.disabled = false;
                }
            }
        });

        // Actualiza el botón en el lightbox si está abierto
        if (elements.lightbox && elements.lightbox.classList.contains('open')) {
            const currentItemId = currentLightboxItems[currentPhotoIndex]?.id;
            if (!currentItemId) return;

            if (currentLightboxContext === 'photo') { // Contexto 'photo' para ítems de featuredOffers y digitalServicesOnly
                const mapKey = 'photo_' + currentItemId;
                if (selectedItems.has(mapKey)) {
                    if (elements.addToSelectionBtn) {
                        elements.addToSelectionBtn.textContent = 'Añadido (' + selectedItems.get(mapKey).quantity + ')';
                        elements.addToSelectionBtn.disabled = false;
                        elements.addToSelectionBtn.classList.add('selected');
                    }
                } else {
                    if (elements.addToSelectionBtn) {
                        elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                        elements.addToSelectionBtn.disabled = false;
                        elements.addToSelectionBtn.classList.remove('selected');
                    }
                }
            } else if (currentLightboxContext === 'product') { // Contexto 'product' para productos de tienda
                const parentProduct = storeProducts.find(p => p.images.some(img => img.id === currentItemId));
                if (!parentProduct) {
                    console.error("No se pudo encontrar el producto padre para la imagen:", currentItemId);
                    return;
                }
                const mapKey = `product_${parentProduct.id}_${currentItemId}`;
                
                if (selectedItems.has(mapKey)) {
                    if (elements.addToSelectionBtn) {
                        elements.addToSelectionBtn.textContent = 'Añadido al Carrito (Cant: ' + selectedItems.get(mapKey).quantity + ')';
                        elements.addToSelectionBtn.disabled = false;
                        elements.addToSelectionBtn.classList.add('selected');
                    }
                } else {
                    if (elements.addToSelectionBtn) {
                        elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                        elements.addToSelectionBtn.disabled = false;
                        elements.addToSelectionBtn.classList.remove('selected');
                    }
                }
            }
        }
    }


    /**
     * Renderiza la lista detallada de ítems seleccionados en el panel del carrito.
     */
    function renderSelectedItemsInCart() {
        if (!elements.selectedItemsList || !elements.packSummaryMessage) return;

        elements.selectedItemsList.innerHTML = ''; // Limpiar lista existente

        if (selectedItems.size === 0) {
            elements.selectedItemsList.innerHTML = '<li class="empty-selection"><i class="fas fa-shopping-cart"></i><p>Tu selección está vacía.<br>¡Añade promociones o productos para empezar a crear!</p></li>';
            elements.packSummaryMessage.style.display = 'none';
            return;
        }

        const selectedOffersArray = []; // Para ítems de tipo 'photo' (servicios digitales y promociones)
        const selectedProductsArray = []; // Para ítems de tipo 'product' (productos de tienda)

        selectedItems.forEach(itemInCart => {
            if (itemInCart.type === 'photo') { 
                selectedOffersArray.push(itemInCart);
            } else if (itemInCart.type === 'product') { 
                selectedProductsArray.push(itemInCart);
            }
        });

        // --- Renderizar Promociones y Servicios Digitales seleccionados ---
        if (selectedOffersArray.length > 0) {
            const offerHeader = document.createElement('li');
            offerHeader.className = 'cart-section-header';
            offerHeader.textContent = 'Promociones y Servicios Digitales Seleccionados';
            elements.selectedItemsList.appendChild(offerHeader);

            selectedOffersArray.forEach(itemInCart => {
                // Asegurarse de usar el precio más reciente del itemData en el carrito
                const item = itemInCart.itemData; 
                const listItem = document.createElement('li');
                listItem.className = 'selected-item-card';

                // Determinar el icono o imagen para el carrito
                let mediaHtml = '';
                if (item.type === 'image' || item.type === 'video') {
                    mediaHtml = `<img src="${item.src}" alt="${item.name || `Ítem ${item.id}`}" loading="lazy">`;
                } else if (item.type === 'pdf') {
                    mediaHtml = `<i class="fas fa-file-pdf" style="font-size: 60px; color: var(--accent-color);"></i>`;
                } else if (item.type === 'powerpoint') {
                    mediaHtml = `<i class="fas fa-file-powerpoint" style="font-size: 60px; color: orange;"></i>`;
                } else {
                    mediaHtml = `<i class="fas fa-file" style="font-size: 60px; color: var(--text-color);"></i>`;
                }

                listItem.innerHTML = `
                    ${mediaHtml}
                    <div class="selected-item-info">
                        <h5>${item.name || `Ítem ${item.id}`}</h5>
                        <p class="item-price">${formatCurrency(item.price)} c/u</p>
                    </div>
                    <div class="quantity-control">
                        <button class="quantity-minus-btn" data-id="${item.id}" data-type="photo">-</button>
                        <span class="quantity-value">${itemInCart.quantity}</span>
                        <button class="quantity-plus-btn" data-id="${item.id}" data-type="photo">+</button>
                    </div>
                    <button class="remove-item-btn"><i class="fas fa-trash-alt"></i></button>
                `;

                listItem.querySelector('.quantity-minus-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    updateItemQuantity(item.id, null, -1, 'photo');
                });
                listItem.querySelector('.quantity-plus-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    updateItemQuantity(item.id, null, 1, 'photo');
                });

                listItem.querySelector('.remove-item-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeItemFromCart(item.id, 'photo'); 
                    showToast(`"${item.name || `Ítem ${item.id}`}" eliminado.`, 'info');
                });

                elements.selectedItemsList.appendChild(listItem);
            });
        }

        // --- Renderizar Productos Personalizados seleccionados ---
        if (selectedProductsArray.length > 0) {
            const productHeader = document.createElement('li');
            productHeader.className = 'cart-section-header';
            productHeader.textContent = 'Productos Personalizados Seleccionados';
            elements.selectedItemsList.appendChild(productHeader);

            selectedProductsArray.forEach(itemInCart => {
                // Asegurarse de usar el precio más reciente del itemData en el carrito
                const product = itemInCart.itemData;
                const selectedImage = itemInCart.selectedImage;
                const listItem = document.createElement('li');
                listItem.className = 'selected-item-card';

                const itemImage = document.createElement('img');
                itemImage.src = `galeria/${selectedImage.src}`;
                itemImage.alt = `${product.name} - Modelo ${selectedImage.name || selectedImage.id}`;
                itemImage.loading = 'lazy';

                const itemInfo = document.createElement('div');
                itemInfo.className = 'selected-item-info';
                itemInfo.innerHTML = `
                    <h5>${product.name} (${selectedImage.name || `Modelo ${selectedImage.id}`})</h5>
                    <p class="item-price">${formatCurrency(product.price * itemInCart.quantity)}</p>
                `;

                const quantityControl = document.createElement('div');
                quantityControl.className = 'quantity-control';
                quantityControl.innerHTML = `
                    <button class="quantity-minus-btn" data-parent-id="${product.id}" data-image-id="${selectedImage.id}" data-type="product">-</button>
                    <span class="quantity-value">${itemInCart.quantity}</span>
                    <button class="quantity-plus-btn" data-parent-id="${product.id}" data-image-id="${selectedImage.id}" data-type="product">+</button>
                `;
                quantityControl.querySelector('.quantity-minus-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    updateItemQuantity(product.id, selectedImage.id, -1, 'product');
                });
                quantityControl.querySelector('.quantity-plus-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    updateItemQuantity(product.id, selectedImage.id, 1, 'product');
                });

                const removeButton = document.createElement('button');
                removeButton.className = 'remove-item-btn';
                removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeItemFromCart(product.id, 'product', selectedImage.id); 
                    showToast(`"${product.name} (${selectedImage.name || `Modelo ${selectedImage.id}`})" eliminado.`, 'info');
                });

                listItem.appendChild(itemImage);
                listItem.appendChild(itemInfo);
                listItem.appendChild(quantityControl); 
                listItem.appendChild(removeButton);
                elements.selectedItemsList.appendChild(listItem);
            });
        }

        const { photoCount } = calculateTotalPrice(); 
        if (photoCount > 0) {
            elements.packSummaryMessage.innerHTML = `Tienes <strong>${photoCount} ítems digitales</strong> seleccionados.`;
            elements.packSummaryMessage.style.display = 'block';
        } else {
            elements.packSummaryMessage.style.display = 'none'; 
        }
    }

    /**
     * Añade o actualiza un ítem en el carrito de compras.
     * @param {object} itemData - El objeto completo del ítem (servicio digital, promoción o producto de tienda).
     * @param {string} type - 'photo' (para servicios digitales/promociones) o 'product' (para productos de tienda).
     * @param {object} [selectedImage=null] - Solo para productos: la imagen específica del producto.
     */
    function addItemToSelection(itemData, type, selectedImage = null) {
        let mapKey;
        let itemToStore;

        if (type === 'photo') { 
            mapKey = 'photo_' + itemData.id;
            if (selectedItems.has(mapKey)) {
                const existingItem = selectedItems.get(mapKey);
                existingItem.quantity += 1;
                selectedItems.set(mapKey, existingItem);
                showToast('Cantidad de ítem actualizada.', 'success');
            } else {
                itemToStore = {
                    originalId: itemData.id,
                    type: 'photo',
                    quantity: 1,
                    itemData: itemData // Se almacena el objeto completo del ítem
                };
                selectedItems.set(mapKey, itemToStore);
                showToast(`"${itemData.name || `Ítem ${itemData.id}`}" añadido a tu selección.`, 'success');
            }
        } else if (type === 'product') { 
            const targetImage = selectedImage || itemData.images[0];
            if (!targetImage) {
                console.error("Error: Producto sin imágenes o imagen seleccionada inválida.", itemData);
                showToast("Error al añadir el producto. Falta imagen.", 'error');
                return;
            }
            mapKey = `product_${itemData.id}_${targetImage.id}`;
            
            let itemInCart = selectedItems.get(mapKey);
            if (itemInCart) {
                itemInCart.quantity++;
                selectedItems.set(mapKey, itemInCart);
                showToast(`Se agregó una unidad más de "${itemData.name} (Modelo ${targetImage.name || targetImage.id})".`, 'success');
            } else {
                itemToStore = {
                    originalId: itemData.id,
                    type: 'product',
                    quantity: 1,
                    itemData: itemData, // Se almacena el objeto completo del producto
                    selectedImage: targetImage
                };
                selectedItems.set(mapKey, itemToStore);
                showToast(`"${itemData.name} (${targetImage.name || `Modelo ${targetImage.id}`})" añadido a tu carrito.`, 'success');
            }
        } else {
            console.error("Tipo de ítem desconocido:", type);
            return;
        }

        saveSelectionToLocalStorage();
        updateSelectionUI();
    }


    /**
     * Actualiza la cantidad de un ítem en el carrito.
     * @param {string} id - El ID del ítem.
     * @param {string | null} imageId - Solo para productos: el ID de la imagen/variante seleccionada.
     * @param {number} change - La cantidad a sumar o restar (-1 o 1).
     * @param {string} itemType - 'photo' o 'product'.
     */
    function updateItemQuantity(id, imageId, change, itemType) {
        let mapKey;
        if (itemType === 'photo') {
            mapKey = 'photo_' + id;
        } else if (itemType === 'product') {
            mapKey = `product_${id}_${imageId}`;
        } else {
            console.error("Tipo de ítem desconocido:", itemType);
            return;
        }

        if (selectedItems.has(mapKey)) {
            const itemInCart = selectedItems.get(mapKey);
            itemInCart.quantity += change;

            if (itemInCart.quantity <= 0) {
                selectedItems.delete(mapKey);
                showToast('Ítem eliminado del carrito.', 'info');
            } else {
                selectedItems.set(mapKey, itemInCart);
                showToast(`Cantidad de ${itemType === 'product' ? 'producto' : 'ítem'} actualizada.`, 'success');
            }
            saveSelectionToLocalStorage();
            updateSelectionUI();
        } else {
            console.warn(`Intento de actualizar cantidad de ítem no existente: ${mapKey}`);
        }
    }

    /**
     * Elimina un ítem completamente del carrito.
     * @param {string} originalId - El ID original del ítem.
     * @param {string} type - 'photo' o 'product'.
     * @param {string} [imageId=null] - Solo para productos: El ID de la imagen específica a eliminar.
     */
    function removeItemFromCart(originalId, type, imageId = null) {
        let mapKey;
        if (type === 'photo') {
            mapKey = 'photo_' + originalId;
        } else if (type === 'product') {
            mapKey = `product_${originalId}_${imageId}`;
        } else {
            console.error("Tipo de ítem desconocido para eliminar:", type);
            return;
        }
        
        selectedItems.delete(mapKey);
        saveSelectionToLocalStorage();
        updateSelectionUI();
    }

    /**
     * Vacía toda la selección del carrito.
     */
    function clearSelection() {
        selectedItems.clear();
        saveSelectionToLocalStorage();
        updateSelectionUI();
        showToast('Tu selección ha sido vaciada. ¡Listo para nuevas creaciones!', 'info');
    }

    /**
     * Abre el lightbox con el ítem especificado.
     * @param {object} item - El objeto ítem (servicio digital, promoción o producto de tienda).
     * @param {number} currentIndex - El índice del ítem actual en la lista filtrada.
     * @param {string} context - 'photo' (para ítems de featuredOffers) o 'product' (para productos de tienda).
     */
    function openLightbox(item, currentIndex, context = 'photo') {
        console.log("DEBUG: openLightbox llamado con item:", item, "index:", currentIndex, "context:", context);
        if (!elements.lightboxImage || !elements.lightboxVideo || !elements.lightboxCaption || !elements.addToSelectionBtn || !elements.lightbox || !elements.lightboxContent) {
            console.error("ERROR: Uno o más elementos del lightbox no encontrados.");
            return;
        }

        // Limpiar contenido previo del lightbox
        elements.lightboxImage.style.display = 'none';
        elements.lightboxVideo.style.display = 'none';
        // Eliminar elementos de icono de archivo si existen
        if (elements.lightboxFileIcon) {
            elements.lightboxFileIcon.remove();
            elements.lightboxFileIcon = null;
        }
        if (elements.lightboxFileName) {
            elements.lightboxFileName.remove();
            elements.lightboxFileName = null;
        }


        currentLightboxContext = context;
        currentPhotoIndex = currentIndex;

        if (context === 'photo') { // Contexto para ítems de featuredOffers y digitalServicesOnly
            // Determinar el array de ítems para la navegación del lightbox
            if (item.originalCategoryName === 'Servicios-Digitales') { 
                currentLightboxItems = digitalServicesOnly;
            } else { // Asumimos que es de featuredOffers (OFERTAS-ESPECIALES o Promociones)
                currentLightboxItems = featuredOffers.filter(fItem => fItem.eventName === item.eventName);
            }
            currentPhotoIndex = currentLightboxItems.findIndex(fItem => fItem.id === item.id);

            const currentItem = currentLightboxItems[currentPhotoIndex];
            
            // Lógica para mostrar diferentes tipos de archivo en Lightbox
            if (currentItem.type === 'image') {
                elements.lightboxImage.src = currentItem.src;
                elements.lightboxImage.style.display = 'block';
            } else if (currentItem.type === 'video') {
                elements.lightboxVideo.src = currentItem.src;
                elements.lightboxVideo.controls = false;
                elements.lightboxVideo.autoplay = false;
                elements.lightboxVideo.loop = true;
                elements.lightboxVideo.muted = true;
                elements.lightboxVideo.preload = 'metadata';
                elements.lightboxVideo.playsInline = true;
                elements.lightboxVideo.style.display = 'block';
            } else if (currentItem.type === 'pdf' || currentItem.type === 'powerpoint') {
                // Para PDF/PPT, mostrar un icono y el nombre del archivo
                elements.lightboxFileIcon = document.createElement('i');
                elements.lightboxFileIcon.className = `fas ${currentItem.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-powerpoint'}`;
                elements.lightboxFileIcon.style.fontSize = '100px';
                elements.lightboxFileIcon.style.color = 'var(--accent-color)';
                elements.lightboxFileIcon.style.marginBottom = '20px';
                // Insertar antes del caption, pero después de imagen/video si estuvieran (aunque no deberían estar visibles)
                elements.lightboxContent.insertBefore(elements.lightboxFileIcon, elements.lightboxCaption); 

                elements.lightboxFileName = document.createElement('p');
                elements.lightboxFileName.textContent = `Archivo: ${currentItem.name || currentItem.id}`;
                elements.lightboxFileName.style.fontSize = '1.2rem';
                elements.lightboxFileName.style.color = 'var(--text-color)';
                elements.lightboxContent.insertBefore(elements.lightboxFileName, elements.lightboxCaption); 
            }
            elements.lightboxCaption.textContent = currentItem.description || currentItem.name || `Ítem ${currentItem.id}`;
            
            elements.addToSelectionBtn.style.display = 'inline-block';
            const mapKey = 'photo_' + currentItem.id;
            if (selectedItems.has(mapKey)) {
                elements.addToSelectionBtn.textContent = 'Añadido (' + selectedItems.get(mapKey).quantity + ')';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.add('selected');
            } else {
                elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.remove('selected');
            }
            elements.addToSelectionBtn.onclick = () => {
                // Si es un producto de "Promociones" (que está en featuredOffers), lo añadimos como tipo 'product' en el carrito
                const productFromPromociones = storeProducts.find(p => p.id === currentItem.id && p.originalCategoryName === 'Promociones'); // Usar originalCategoryName
                if (productFromPromociones) {
                    addItemToSelection(productFromPromociones, 'product', productFromPromociones.images[0]);
                } else {
                    addItemToSelection(currentItem, 'photo'); // Para servicios digitales (OFERTAS-ESPECIALES, PDF, PPT, etc.)
                }
            };

        } else if (context === 'product') { // Contexto para productos de la sección tienda
            currentLightboxItems = item.images;
            if (item.images && item.images.length > 0) {
                elements.lightboxImage.src = `galeria/${item.images[currentPhotoIndex].src}`;
                elements.lightboxImage.style.display = 'block';
            }
            elements.lightboxCaption.textContent = item.name;

            elements.addToSelectionBtn.style.display = 'inline-block';
            const currentProductImageVariant = currentLightboxItems[currentPhotoIndex];
            const mapKey = `product_${item.id}_${currentProductImageVariant.id}`;
            
            if (selectedItems.has(mapKey)) {
                elements.addToSelectionBtn.textContent = 'Añadido al Carrito (Cant: ' + selectedItems.get(mapKey).quantity + ')';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.add('selected');
            } else {
                if (elements.addToSelectionBtn) {
                    elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                    elements.addToSelectionBtn.disabled = false;
                    elements.addToSelectionBtn.classList.remove('selected');
                }
            }
            elements.addToSelectionBtn.onclick = () => {
                addItemToSelection(item, 'product', currentProductImageVariant);
            };
        }

        elements.lightbox.classList.add('open');
        setBodyNoScroll();
    }

    /**
     * Cierra el lightbox.
     */
    function closeLightbox() {
        if (!elements.lightbox || !elements.lightboxVideo) return;
        elements.lightbox.classList.remove('open');
        elements.lightboxVideo.pause();
        elements.lightboxVideo.removeAttribute('src'); // Limpiar src del video
        elements.lightboxImage.removeAttribute('src'); // Limpiar src de la imagen
        // Eliminar elementos de icono de archivo si existen
        if (elements.lightboxFileIcon) {
            elements.lightboxFileIcon.remove();
            elements.lightboxFileIcon = null;
        }
        if (elements.lightboxFileName) {
            elements.lightboxFileName.remove();
            elements.lightboxFileName = null;
        }
        removeBodyNoScroll();
        updateGridButtonsState();
    }

    /**
     * Navega por el lightbox (imagen siguiente/anterior).
     * @param {number} direction - -1 para anterior, 1 para siguiente.
     */
    function navigateLightbox(direction) {
        if (!elements.lightboxImage || !elements.lightboxVideo || !elements.lightboxCaption || !elements.addToSelectionBtn || !elements.lightboxContent) return;
        let newIndex = currentPhotoIndex + direction;

        if (!currentLightboxItems || currentLightboxItems.length === 0) return;

        if (newIndex < 0) {
            newIndex = currentLightboxItems.length - 1;
        } else if (newIndex >= currentLightboxItems.length) {
            newIndex = 0;
        }
        
        currentPhotoIndex = newIndex;
        const newItem = currentLightboxItems[currentPhotoIndex];

        // Limpiar contenido previo del lightbox antes de mostrar el nuevo ítem
        elements.lightboxImage.style.display = 'none';
        elements.lightboxVideo.style.display = 'none';
        elements.lightboxVideo.pause();
        elements.lightboxVideo.removeAttribute('src');
        elements.lightboxImage.removeAttribute('src');
        if (elements.lightboxFileIcon) {
            elements.lightboxFileIcon.remove();
            elements.lightboxFileIcon = null;
        }
        if (elements.lightboxFileName) {
            elements.lightboxFileName.remove();
            elements.lightboxFileName = null;
        }

        // Lógica para mostrar diferentes tipos de archivo en Lightbox
        if (newItem.type === 'image') {
            elements.lightboxImage.src = newItem.src;
            elements.lightboxImage.style.display = 'block';
        } else if (newItem.type === 'video') {
            elements.lightboxVideo.src = newItem.src;
            elements.lightboxVideo.controls = true;
            elements.lightboxVideo.autoplay = false;
            elements.lightboxVideo.loop = true;
            elements.lightboxVideo.muted = true;
            elements.lightboxVideo.preload = 'auto';
            elements.lightboxVideo.playsInline = true;
            elements.lightboxVideo.style.display = 'block';
        } else if (newItem.type === 'pdf' || newItem.type === 'powerpoint') {
            elements.lightboxFileIcon = document.createElement('i');
            elements.lightboxFileIcon.className = `fas ${newItem.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-powerpoint'}`;
            elements.lightboxFileIcon.style.fontSize = '100px';
            elements.lightboxFileIcon.style.color = 'var(--accent-color)';
            elements.lightboxFileIcon.style.marginBottom = '20px';
            elements.lightboxContent.insertBefore(elements.lightboxFileIcon, elements.lightboxCaption);

            elements.lightboxFileName = document.createElement('p');
            elements.lightboxFileName.textContent = `Archivo: ${newItem.name || newItem.id}`;
            elements.lightboxFileName.style.fontSize = '1.2rem';
            elements.lightboxFileName.style.color = 'var(--text-color)';
            elements.lightboxContent.insertBefore(elements.lightboxFileName, elements.lightboxCaption);
        }
        
        elements.lightboxCaption.textContent = newItem.description || newItem.name || `Ítem ${newItem.id}`;

        if (currentLightboxContext === 'photo') {
            const mapKey = 'photo_' + newItem.id;
            if (selectedItems.has(mapKey)) {
                elements.addToSelectionBtn.textContent = 'Añadido (' + selectedItems.get(mapKey).quantity + ')';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.add('selected');
            } else {
                elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.remove('selected');
            }
            elements.addToSelectionBtn.onclick = () => {
                const productFromPromociones = storeProducts.find(p => p.id === newItem.id && p.originalCategoryName === 'Promociones'); // Usar originalCategoryName
                if (productFromPromociones) {
                    addItemToSelection(productFromPromociones, 'product', productFromPromociones.images[0]);
                } else {
                    addItemToSelection(newItem, 'photo');
                }
            };
        } else if (currentLightboxContext === 'product') {
            const productParent = storeProducts.find(p => p.images.some(img => img.id === currentLightboxItems[0].id));
            if (!productParent) {
                 console.error("No se pudo encontrar el producto padre para la navegación de imagen del lightbox.");
                 return;
            }
            const currentProductImageVariant = newItem;
            const mapKey = `product_${productParent.id}_${currentProductImageVariant.id}`;
            
            if (selectedItems.has(mapKey)) {
                elements.addToSelectionBtn.textContent = 'Añadido al Carrito (Cant: ' + selectedItems.get(mapKey).quantity + ')';
                elements.addToSelectionBtn.disabled = false;
                elements.addToSelectionBtn.classList.add('selected');
            } else {
                if (elements.addToSelectionBtn) {
                    elements.addToSelectionBtn.textContent = 'Añadir al Carrito';
                    elements.addToSelectionBtn.disabled = false;
                    elements.addToSelectionBtn.classList.remove('selected');
                }
            }
            elements.addToSelectionBtn.onclick = () => {
                addItemToSelection(productParent, 'product', currentProductImageVariant);
            };
        }
    }


    /**
     * Genera el mensaje de WhatsApp con el resumen del pedido.
     * @returns {string} La URL de WhatsApp.
     */
    function generateWhatsAppMessage() {
        const { total, photoCount } = calculateTotalPrice();
        let message = `¡Hola! Estoy emocionado(a) por mi pedido de Recuerdos de Papel y me gustaría confirmarlo.\n\n`;

        let offersAddedSection = false;
        let productsAddedSection = false;
        let digitalFilesAddedSection = false; // Nuevo: para la sección de archivos digitales
        let digitalFileIdsList = []; // Para recolectar los IDs de los archivos digitales

        selectedItems.forEach(itemInCart => {
            console.log(`DEBUG: generatePaymentWhatsAppUrl - Procesando ítem en carrito: ID: ${itemInCart.originalId}, Tipo: ${itemInCart.type}, Nombre: ${itemInCart.itemData.name}, Categoría Original: ${itemInCart.itemData.originalCategoryName}`);

            if (itemInCart.type === 'product') {
                // Esto incluye productos de 'tienda-productos' y productos de 'Promociones'
                const productName = itemInCart.itemData.name;
                const imageModelName = itemInCart.selectedImage ? (itemInCart.selectedImage.name || `Modelo ${itemInCart.selectedImage.id}`) : '';
                if (!productsAddedSection) {
                    message += `🎁 Tus Productos Personalizados Seleccionados:\n`;
                    productsAddedSection = true;
                }
                message += `- ${itemInCart.quantity}x ${productName}${imageModelName ? ` (${imageModelName})` : ''} (${formatCurrency(itemInCart.itemData.price || 0)})\n`;
            } else if (itemInCart.type === 'photo') {
                // Los ítems de tipo 'photo' provienen de 'OFERTAS-ESPECIALES' o 'Servicios-Digitales'
                if (itemInCart.itemData.originalCategoryName === 'Servicios-Digitales') {
                    // Estos son los verdaderos archivos digitales (PDF, PPT, etc.)
                    if (!digitalFilesAddedSection) {
                        message += `✨ Tus Archivos Digitales Seleccionados:\n`;
                        digitalFilesAddedSection = true;
                    }
                    const itemTypeDisplay = itemInCart.itemData.type === 'pdf' ? 'PDF' : itemInCart.itemData.type === 'powerpoint' ? 'PPT' : 'Archivo';
                    message += `- ${itemInCart.quantity}x ${itemInCart.itemData.name || `Archivo ${itemInCart.originalId}`} (Tipo: ${itemTypeDisplay})\n`;
                    // Recolectar IDs para la lista final
                    for (let i = 0; i < itemInCart.quantity; i++) {
                        digitalFileIdsList.push(itemInCart.originalId);
                    }
                } else if (itemInCart.itemData.originalCategoryName === 'OFERTAS-ESPECIALES') {
                    if (!offersAddedSection) {
                        message += `✨ Tus Promociones Digitales Seleccionadas:\n`;
                        offersAddedSection = true;
                    }
                    message += `- ${itemInCart.quantity}x ${itemInCart.itemData.name || `Promoción ${itemInCart.originalId}`} (${formatCurrency(itemInCart.itemData.price)} c/u)\n`;
                }
            }
        });
        
        message += `\n`;

        message += `💵 *Total Estimado*: ${formatCurrency(total)}\n\n`;
        
        // Agregar los IDs de los archivos digitales de forma destacada
        if (digitalFileIdsList.length > 0) {
            const uniqueDigitalFileIds = [...new Set(digitalFileIdsList)]; // Asegurarse de IDs únicos
            message += `🚨 *ARCHIVOS DIGITALES (IDs para generar enlace):*\n`;
            message += `${uniqueDigitalFileIds.join(', ')}\n\n`;
        }

        message += `¡Estoy listo(a) para coordinar el pago y la entrega de mis creaciones!`;
        message += `\n*Por favor, recuerda adjuntar el comprobante de pago a este mensaje.* ¡Gracias! 😊`; // Nuevo recordatorio

        console.log("DEBUG: Mensaje de WhatsApp final antes de codificar:", message); // DEBUG: Log del mensaje final

        return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }


    // --- Renderizado de Contenido Dinámico ---

    /**
     * Renderiza la cuadrícula de "promociones destacadas" (ítems de OFERTAS-ESPECIALES y Promociones).
     * @param {HTMLElement} container - El contenedor donde se renderizan los ítems.
     * @param {Array<object>} itemsToRender - Array de ítems.
     */
    function renderFeaturedOffersDirectly(container, itemsToRender) {
        if (!container) return;

        container.innerHTML = '';
        const filteredItems = itemsToRender.filter(item => 
            item.originalCategoryName === 'OFERTAS-ESPECIALES' || item.originalCategoryName === 'Promociones'
        );

        if (filteredItems.length === 0) {
            container.innerHTML = '<p class="event-placeholder">No hay promociones especiales disponibles en este momento. ¡Pronto subiremos más magia!</p>';
            return;
        }

        filteredItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.dataset.id = item.id;
            card.dataset.type = 'photo'; // Todos los ítems en esta sección se tratan como 'photo' para el carrito

            if (selectedItems.has('photo_' + item.id) && selectedItems.get('photo_' + item.id).quantity > 0) {
                card.classList.add('selected');
            }

            let mediaElementHtml = '';
            
            if (item.type === 'video') {
                mediaElementHtml = `
                    <video src="${item.src}" controls muted loop playsinline preload="metadata"></video>
                    <i class="fas fa-video video-icon"></i>
                `;
            } else if (item.type === 'image') {
                mediaElementHtml = `<img src="${item.src}" alt="${item.name || `Ítem ${item.id}`}" loading="lazy">`;
            } else { // Fallback para tipos desconocidos, aunque no debería ocurrir aquí
                mediaElementHtml = `
                    <div class="file-icon-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #333;">
                        <i class="fas fa-file" style="font-size: 80px; color: var(--text-color);"></i>
                        <p style="color: white; margin-top: 10px; font-size: 1.1rem; text-align: center;">${item.name || item.id}</p>
                    </div>
                `;
            }

            card.innerHTML = `
                ${mediaElementHtml}
                <div class="photo-card-overlay">
                    <span class="photo-title">${item.name || `Ítem ${item.id}`}</span>
                    <p class="item-price">${formatCurrency(item.price)}</p> <!-- Precio visible aquí -->
                    <button class="select-button"></button>
                </div>
            `;

            const addToCartBtn = card.querySelector('.select-button');
            if (selectedItems.has('photo_' + item.id) && selectedItems.get('photo_' + item.id).quantity > 0) {
                addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${selectedItems.get('photo_' + item.id).quantity})`;
                addToCartBtn.disabled = false;
            } else {
                addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                addToCartBtn.disabled = false;
            }

            card.addEventListener('click', (e) => {
                if (e.target && !e.target.closest('.select-button')) {
                    openLightbox(item, index, 'photo');
                }
            });

            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Si el ítem es un producto de "Promociones" (identificado por su originalCategoryName), lo añadimos como tipo 'product' en el carrito
                if (item.originalCategoryName === 'Promociones') { 
                    const productData = storeProducts.find(p => p.id === item.id);
                    if (productData) {
                        addItemToSelection(productData, 'product', productData.images[0]);
                    } else {
                        console.error("No se encontró el producto de Promociones en storeProducts:", item.id);
                        addItemToSelection(item, 'photo'); // Fallback a tipo 'photo' si no se encuentra
                    }
                } else {
                    addItemToSelection(item, 'photo'); // Para servicios digitales (OFERTAS-ESPECIALES)
                }
            });

            container.appendChild(card);
        });
    }

    /**
     * Renderiza la cuadrícula de productos para la sección de la tienda.
     * @param {HTMLElement} container - El contenedor donde se renderizan los productos.
     * @param {Array<object>} productsToRender - Array de objetos de producto.
     */
    function renderGridForProducts(container, productsToRender) {
        if (!container) return;

        container.innerHTML = '';
        // Filtrar productos que NO son de la categoría "Promociones"
        const filteredProducts = productsToRender.filter(p => p.originalCategoryName !== 'Promociones');

        if (filteredProducts.length === 0) {
            container.innerHTML = '<p class="event-placeholder">¡Pronto tendremos más productos personalizados increíbles para ti! Vuelve pronto.</p>';
            return;
        }

        console.log("DEBUG: renderGridForProducts called with productsToRender:", filteredProducts.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.originalCategoryName }))); // DEBUG

        filteredProducts.forEach(product => {
            // console.log(`DEBUG: Rendering product in store grid: ${product.name}, src: ${product.src}`); // Too verbose

            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            card.dataset.type = 'product';

            const productHasAnyVariantInCart = Array.from(selectedItems.keys()).some(key => key.startsWith(`product_${product.id}_`));
            if (productHasAnyVariantInCart) { 
                card.classList.add('selected');
            }

            const firstImageSrc = product.src;
            card.innerHTML = `
                <img src="${firstImageSrc}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatCurrency(product.price || 0)}</p> <!-- Precio visible aquí -->
                    <button class="add-to-cart-btn"></button>
                </div>
            `;

            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) { // Asegurarse de que el botón existe antes de intentar modificarlo
                if (productHasAnyVariantInCart) {
                    let totalProductQuantity = 0;
                    selectedItems.forEach(itemInCart => {
                        if (itemInCart.type === 'product' && itemInCart.originalId === product.id) {
                            totalProductQuantity += itemInCart.quantity;
                        }
                    });
                    addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${totalProductQuantity})`;
                    addToCartBtn.disabled = false;
                } else {
                    addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                    addToCartBtn.disabled = false;
                }
            }
            
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addItemToSelection(product, 'product', product.images[0]); 
                });
            }
            
            card.addEventListener('click', (e) => {
                if (e.target && !e.target.closest('.add-to-cart-btn')) {
                    openLightbox(product, 0, 'product'); 
                }
            });

            container.appendChild(card);
        });
    }

    /**
     * Renderiza la cuadrícula de "Servicios Digitales" (PDFs, PPTs, etc.).
     * @param {HTMLElement} container - El contenedor donde se renderizan los ítems.
     * @param {Array<object>} itemsToRender - Array de ítems (solo de la categoría "Servicios Digitales").
     */
    function renderDigitalServices(container, itemsToRender) {
        if (!container) return;

        container.innerHTML = '';
        const filteredDigitalItems = itemsToRender.filter(item => 
            item.originalCategoryName === 'Servicios-Digitales' 
        );

        if (filteredDigitalItems.length === 0) {
            container.innerHTML = '<p class="event-placeholder">No hay archivos digitales disponibles en este momento. ¡Pronto subiremos más!</p>';
            return;
        }

        filteredDigitalItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'photo-card'; // Reutilizamos la clase photo-card
            card.dataset.id = item.id;
            card.dataset.type = 'photo'; // Se tratan como 'photo' para el carrito

            if (selectedItems.has('photo_' + item.id) && selectedItems.get('photo_' + item.id).quantity > 0) {
                card.classList.add('selected');
            }

            let mediaElementHtml = '';
            // Lógica para mostrar diferentes tipos de archivo
            if (item.type === 'pdf') {
                mediaElementHtml = `
                    <div class="file-icon-container">
                        <i class="fas fa-file-pdf" style="color: var(--accent-color);"></i>
                        <p>${item.name || item.id}</p>
                    </div>
                `;
            } else if (item.type === 'powerpoint') {
                mediaElementHtml = `
                    <div class="file-icon-container">
                        <i class="fas fa-file-powerpoint" style="color: orange;"></i>
                        <p>${item.name || item.id}</p>
                    </div>
                `;
            } else { // Fallback para otros tipos de archivos digitales si los hubiera
                mediaElementHtml = `
                    <div class="file-icon-container">
                        <i class="fas fa-file" style="color: var(--text-color);"></i>
                        <p>${item.name || item.id}</p>
                    </div>
                `;
            }

            card.innerHTML = `
                ${mediaElementHtml}
                <div class="photo-card-overlay">
                    <span class="photo-title">${item.name || `Archivo ${item.id}`}</span>
                    <p class="item-price">${formatCurrency(item.price)}</p> <!-- Precio visible aquí -->
                    <button class="select-button"></button>
                </div>
            `;

            const addToCartBtn = card.querySelector('.select-button');
            if (selectedItems.has('photo_' + item.id) && selectedItems.get('photo_' + item.id).quantity > 0) {
                addToCartBtn.innerHTML = `<i class="fas fa-check-circle"></i> Añadido (${selectedItems.get('photo_' + item.id).quantity})`;
                addToCartBtn.disabled = false;
            } else {
                addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Añadir';
                addToCartBtn.disabled = false;
            }

            card.addEventListener('click', (e) => {
                if (e.target && !e.target.closest('.select-button')) {
                    openLightbox(item, index, 'photo'); // Usamos 'photo' context ya que son servicios digitales
                }
            });

            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addItemToSelection(item, 'photo'); 
            });

            container.appendChild(card);
        });
    }


    // --- Carga de Datos ---
    /**
     * Carga datos de data.json y los clasifica en las listas globales.
     */
    async function loadDataFromJSON() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("DEBUG: data.json loaded successfully.", data);

            // Reiniciar arrays para evitar duplicados en recargas
            downloadableServices = [];
            digitalServicesOnly = []; // Reiniciar también esta lista
            storeProducts = [];
            featuredOffers = [];

            data.forEach(category => {
                if (category.isProductCategory) {
                    // Handle product categories (tienda-productos and Promociones)
                    category.products.forEach(p => {
                        const processedImages = (p.images || [p]).map(img => ({
                            ...img,
                            src: img.src,
                            name: img.name || img.src.split(/[\/\\]/).pop().split('.')[0]
                        }));

                        // For products, price is stored as 'productPrice_{id}'
                        const savedPrice = localStorage.getItem(`productPrice_${p.id}`);
                        const finalPrice = savedPrice !== null ? parseFloat(savedPrice) : (p.price || 1500); 

                        const productData = {
                            ...p,
                            price: finalPrice,
                            images: processedImages,
                            src: processedImages.length > 0 ? `galeria/${processedImages[0].src}` : 'https://placehold.co/400x300/cccccc/333333?text=Sin+Imagen',
                            // Add original category name for easier debugging/filtering if needed
                            originalCategoryName: category.name
                        };

                        // All physical products (from 'tienda-productos' and 'Promociones') go into storeProducts
                        storeProducts.push(productData);
                        console.log(`DEBUG: Loaded Product: ID: ${productData.id}, Name: ${productData.name}, Price: ${productData.price}, Category: ${productData.originalCategoryName}`);


                        // Only 'Promociones' products also go into featuredOffers for display in the main section
                        if (category.name === 'Promociones') {
                            featuredOffers.push({
                                id: productData.id,
                                name: productData.name,
                                type: 'image', // Treat as image for display in featuredOffers
                                src: productData.src, // Use the main product image src
                                eventName: category.name, // Keep category context for featuredOffers rendering
                                originalCategoryName: category.name,
                                price: productData.price // Ensure price is carried over
                            });
                        }
                    });
                } else { // Handle non-product categories (downloadable services and other event categories)
                    category.content.forEach(item => {
                        // For digital promotions/services, price is stored as 'digitalPromotionPrice_{id}'
                        const savedPrice = localStorage.getItem(`digitalPromotionPrice_${item.id}`);
                        const finalPrice = savedPrice !== null ? parseFloat(savedPrice) : 1000;
                        const serviceData = {
                            ...item,
                            src: `galeria/${item.src}`, // Asegurarse de que la ruta sea correcta desde la raíz de `galeria`
                            name: item.name || item.src.split(/[\/\\]/).pop().split('.')[0],
                            price: finalPrice,
                            originalCategoryName: category.name // Add original category name
                        };
                        
                        // All non-product items are considered downloadable services
                        downloadableServices.push(serviceData);
                        console.log(`DEBUG: Loaded Service: ID: ${serviceData.id}, Name: ${serviceData.name}, Price: ${serviceData.price}, Category: ${serviceData.originalCategoryName}`);


                        // Items from 'OFERTAS-ESPECIALES' go into featuredOffers for display in the main section
                        if (category.name === 'OFERTAS-ESPECIALES') {
                            featuredOffers.push({
                                ...serviceData,
                                eventName: category.name // This is used for grouping in lightbox
                            });
                        }
                        // Items from 'Servicios-Digitales' go into digitalServicesOnly
                        if (category.name === 'Servicios-Digitales') { 
                            digitalServicesOnly.push({
                                ...serviceData,
                                eventName: category.name // This is used for grouping in lightbox
                            });
                        }
                    });
                }
            });

            // Sort for consistent display
            downloadableServices.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            digitalServicesOnly.sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Ordenar también esta lista
            storeProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            featuredOffers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));


            console.log("DEBUG: Final downloadableServices:", downloadableServices.map(item => ({ id: item.id, name: item.name, price: item.price, category: item.originalCategoryName })));
            console.log("DEBUG: Final digitalServicesOnly:", digitalServicesOnly.map(item => ({ id: item.id, name: item.name, price: item.price, category: item.originalCategoryName }))); 
            console.log("DEBUG: Final storeProducts:", storeProducts.map(item => ({ id: item.id, name: item.name, price: item.price, category: item.originalCategoryName })));
            console.log("DEBUG: Final featuredOffers:", featuredOffers.map(item => ({ id: item.id, name: item.name, price: item.price, category: item.originalCategoryName })));

            // Renderizar usando las listas específicas
            renderFeaturedOffersDirectly(elements.eventsContainer, featuredOffers);
            renderGridForProducts(elements.featuredProductsGrid, storeProducts); // Pass storeProducts to render all of them
            renderDigitalServices(elements.digitalServicesGrid, digitalServicesOnly); // NUEVO: Renderizar servicios digitales
            updateSelectionUI();

        } catch (error) {
            console.error("Critical error loading or processing data.json:", error);
            showToast("Error crítico al cargar los datos. Por favor, contacta a soporte.", 'error');
            if (elements.eventsContainer) elements.eventsContainer.innerHTML = '<p class="event-placeholder">¡Lo sentimos! Hubo un problema al cargar las promociones. Por favor, intenta de nuevo más tarde.</p>';
            if (elements.featuredProductsGrid) elements.featuredProductsGrid.innerHTML = '<p class="event-placeholder">¡Lo sentimos! Hubo un problema al cargar los productos. Por favor, intenta de nuevo más tarde.</p>';
            if (elements.digitalServicesGrid) elements.digitalServicesGrid.innerHTML = '<p class="event-placeholder">¡Lo sentimos! Hubo un problema al cargar los servicios digitales. Por favor, intenta de nuevo más tarde.</p>';
        }
    }

    // --- Funciones del Panel de Administración ---

    /**
     * Rellena el menú desplegable de selección de promociones destacadas en el panel de administración.
     */
    function populateFeaturedPromotionSelect() {
        if (!elements.featuredPromotionSelect) return;

        elements.featuredPromotionSelect.innerHTML = '<option value="">-- Selecciona una promoción destacada --</option>';

        const sortedFeaturedOffers = [...featuredOffers].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        sortedFeaturedOffers.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name || `ID: ${item.id}`} (${item.originalCategoryName})`;
            elements.featuredPromotionSelect.appendChild(option);
        });

        displaySelectedFeaturedPromotionPriceInput();
    }

    /**
     * Muestra el campo de entrada de precio para la promoción destacada actualmente seleccionada.
     */
    function displaySelectedFeaturedPromotionPriceInput() {
        const selectedItemId = elements.featuredPromotionSelect ? elements.featuredPromotionSelect.value : null;
        if (!elements.selectedFeaturedPromotionPriceInputContainer) return;
        elements.selectedFeaturedPromotionPriceInputContainer.innerHTML = '<p class="event-placeholder">Selecciona una promoción destacada para modificar su precio.</p>';

        if (selectedItemId) {
            const item = featuredOffers.find(f => f.id === selectedItemId);
            if (item) {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', `featured-promotion-price-${item.id}`);
                label.textContent = `Precio de ${item.name || `ID: ${item.id}`}:`;
                formGroup.appendChild(label);

                const input = document.createElement('input');
                input.type = 'number';
                input.id = `featured-promotion-price-${item.id}`;
                input.min = '0';
                input.step = '100';
                input.dataset.itemId = item.id;
                input.value = item.price;
                formGroup.appendChild(input);

                elements.selectedFeaturedPromotionPriceInputContainer.innerHTML = '';
                elements.selectedFeaturedPromotionPriceInputContainer.appendChild(formGroup);
            }
        }
    }

    /**
     * Guarda el precio de la promoción destacada seleccionada.
     */
    function saveFeaturedPromotionPrice() {
        const selectedItemId = elements.featuredPromotionSelect ? elements.featuredPromotionSelect.value : null;
        if (!selectedItemId) {
            if (elements.priceUpdateMessage) {
                elements.priceUpdateMessage.textContent = 'Por favor, selecciona una promoción destacada para guardar su precio.';
                elements.priceUpdateMessage.style.color = 'var(--accent-color)';
            }
            return;
        }

        if (elements.selectedFeaturedPromotionPriceInputContainer) {
            const priceInput = elements.selectedFeaturedPromotionPriceInputContainer.querySelector(`input[data-item-id="${selectedItemId}"]`);
            if (priceInput) {
                const newPrice = parseFloat(priceInput.value);
                if (isNaN(newPrice) || newPrice < 0) {
                    if (elements.priceUpdateMessage) {
                        elements.priceUpdateMessage.textContent = 'Por favor, introduce un número positivo válido para el precio.';
                        elements.priceUpdateMessage.style.color = 'var(--accent-color)';
                    }
                    priceInput.style.borderColor = 'var(--accent-color)';
                    return;
                } else {
                    // Update in featuredOffers array
                    const itemToUpdateInFeatured = featuredOffers.find(f => f.id === selectedItemId);
                    if (itemToUpdateInFeatured) {
                        itemToUpdateInFeatured.price = newPrice;
                        // Also update in the source array (downloadableServices or storeProducts)
                        if (itemToUpdateInFeatured.originalCategoryName === 'Promociones') {
                            const productInStore = storeProducts.find(p => p.id === selectedItemId);
                            if (productInStore) productInStore.price = newPrice;
                            localStorage.setItem(`productPrice_${selectedItemId}`, newPrice);
                            console.log(`DEBUG: Precio de producto de Promociones actualizado en storeProducts: ${selectedItemId}, Nuevo Precio: ${newPrice}`); // DEBUG
                        } else { // It's from OFERTAS-ESPECIALES
                            const serviceInDownloadable = downloadableServices.find(s => s.id === selectedItemId);
                            if (serviceInDownloadable) serviceInDownloadable.price = newPrice;
                            localStorage.setItem(`digitalPromotionPrice_${selectedItemId}`, newPrice);
                            console.log(`DEBUG: Precio de servicio digital (OFERTAS-ESPECIALES) actualizado en downloadableServices: ${selectedItemId}, Nuevo Precio: ${newPrice}`); // DEBUG
                        }
                        priceInput.style.borderColor = '';
                        if (elements.priceUpdateMessage) {
                            elements.priceUpdateMessage.textContent = 'Precio de promoción destacada guardado correctamente.';
                            elements.priceUpdateMessage.style.color = 'var(--whatsapp-color)';
                            setTimeout(() => {
                                if (elements.priceUpdateMessage) elements.priceUpdateMessage.textContent = '';
                            }, 3000);
                        }
                        // Re-render relevant sections to reflect price changes
                        renderFeaturedOffersDirectly(elements.eventsContainer, featuredOffers);
                        updateSelectionUI(); 
                    }
                }
            }
        }
    }


    /**
     * Rellena el menú desplegable de selección de productos de tienda en el panel de administración.
     */
    function populateStoreProductSelect() {
        if (!elements.storeProductSelect) return;

        elements.storeProductSelect.innerHTML = '<option value="">-- Selecciona un producto de tienda --</option>';

        // Filtrar productos que SÍ son de la categoría "tienda-productos"
        const filteredStoreProducts = storeProducts.filter(p => p.originalCategoryName === 'tienda-productos'); // SOLO productos de tienda-productos
        const sortedProducts = [...filteredStoreProducts].sort((a, b) => a.name.localeCompare(b.name));

        console.log("DEBUG: populateStoreProductSelect - Productos de tienda a poblar:", sortedProducts.map(p => ({ id: p.id, name: p.name, category: p.originalCategoryName }))); // DEBUG

        sortedProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            elements.storeProductSelect.appendChild(option);
        });

        displaySelectedStoreProductPriceInput();
    }

    /**
     * Muestra el campo de entrada de precio para el producto de tienda actualmente seleccionado en el panel de administración.
     */
    function displaySelectedStoreProductPriceInput() {
        const selectedProductId = elements.storeProductSelect ? elements.storeProductSelect.value : null;
        if (!elements.selectedStoreProductPriceInputContainer) return;
        elements.selectedStoreProductPriceInputContainer.innerHTML = '<p class="event-placeholder">Selecciona un producto de tienda para modificar su precio.</p>';

        if (selectedProductId) {
            const product = storeProducts.find(p => p.id === selectedProductId && p.originalCategoryName === 'tienda-productos'); // Asegurarse de que sea de tienda-productos
            if (product) {
                console.log(`DEBUG: displaySelectedStoreProductPriceInput - Producto seleccionado: ${product.name}, ID: ${product.id}, Precio actual: ${product.price}, Categoría: ${product.originalCategoryName}`); // DEBUG
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', `store-product-price-${product.id}`);
                label.textContent = `Precio de ${product.name}:`;
                formGroup.appendChild(label);

                const input = document.createElement('input');
                input.type = 'number';
                input.id = `store-product-price-${product.id}`;
                input.min = '0';
                input.step = '100';
                input.dataset.productId = product.id;
                input.value = product.price;
                formGroup.appendChild(input);

                elements.selectedStoreProductPriceInputContainer.innerHTML = '';
                elements.selectedStoreProductPriceInputContainer.appendChild(formGroup);
            } else {
                console.warn(`WARN: displaySelectedStoreProductPriceInput - Producto con ID ${selectedProductId} no encontrado o no es de 'tienda-productos'.`); // DEBUG
            }
        }
    }

    /**
     * Guarda el precio del producto de tienda seleccionado.
     */
    function saveStoreProductPrices() {
        const selectedProductId = elements.storeProductSelect ? elements.storeProductSelect.value : null;
        if (!selectedProductId) {
            if (elements.priceUpdateMessage) {
                elements.priceUpdateMessage.textContent = 'Por favor, selecciona un producto de tienda para guardar su precio.';
                elements.priceUpdateMessage.style.color = 'var(--accent-color)';
            }
            return;
        }

        if (elements.selectedStoreProductPriceInputContainer) {
            const productPriceInput = elements.selectedStoreProductPriceInputContainer.querySelector(`input[data-product-id="${selectedProductId}"]`);
            if (productPriceInput) {
                const newPrice = parseFloat(productPriceInput.value);
                console.log(`DEBUG: saveStoreProductPrices - Intentando guardar precio para ID: ${selectedProductId}, Nuevo Precio Input: ${newPrice}`); // DEBUG
                if (isNaN(newPrice) || newPrice < 0) {
                    if (elements.priceUpdateMessage) {
                        elements.priceUpdateMessage.textContent = 'Por favor, introduce un número positivo válido para el precio del producto seleccionado.';
                        elements.priceUpdateMessage.style.color = 'var(--accent-color)';
                    }
                    productPriceInput.style.borderColor = 'var(--accent-color)';
                    return;
                } else {
                    const productToUpdate = storeProducts.find(p => p.id === selectedProductId && p.originalCategoryName === 'tienda-productos'); // Asegurarse de que sea de tienda-productos
                    if (productToUpdate) {
                        productToUpdate.price = newPrice;
                        localStorage.setItem(`productPrice_${selectedProductId}`, newPrice);
                        console.log(`DEBUG: Precio de producto de tienda actualizado en storeProducts: ${selectedProductId}, Nuevo Precio: ${newPrice}`); // DEBUG
                        productPriceInput.style.borderColor = '';
                        if (elements.priceUpdateMessage) {
                            elements.priceUpdateMessage.textContent = 'Precio del producto de tienda guardado correctamente.';
                            elements.priceUpdateMessage.style.color = 'var(--whatsapp-color)';
                            setTimeout(() => {
                                if (elements.priceUpdateMessage) elements.priceUpdateMessage.textContent = '';
                            }, 3000);
                        }
                        renderGridForProducts(elements.featuredProductsGrid, storeProducts); // Re-render the store products
                        updateSelectionUI(); 
                    } else {
                        console.error(`ERROR: No se encontró el producto con ID ${selectedProductId} (o no es de 'tienda-productos') en storeProducts para actualizar.`); // DEBUG
                    }
                }
            }
        }
    }

    /**
     * Rellena el menú desplegable de selección de servicios digitales.
     */
    function populateDigitalServiceSelect() {
        if (!elements.digitalServiceSelect) return;

        elements.digitalServiceSelect.innerHTML = '<option value="">-- Selecciona un servicio digital --</option>';

        // Ahora solo poblamos con ítems de la lista digitalServicesOnly
        const sortedDigitalServicesOnly = [...digitalServicesOnly].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        sortedDigitalServicesOnly.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name || `ID: ${service.id}`} (${service.originalCategoryName})`;
            elements.digitalServiceSelect.appendChild(option);
        });

        displaySelectedDigitalServiceInput();
    }

    /**
     * Muestra el campo de entrada de precio para el servicio digital actualmente seleccionado en el panel de administración.
     */
    function displaySelectedDigitalServiceInput() { // Renombrado para reflejar que no es solo precio
        const selectedServiceId = elements.digitalServiceSelect ? elements.digitalServiceSelect.value : null;
        if (!elements.selectedDigitalServicePriceInputContainer) return;
        elements.selectedDigitalServicePriceInputContainer.innerHTML = '<p class="event-placeholder">Selecciona un servicio digital para modificar su precio.</p>';

        if (selectedServiceId) {
            const service = downloadableServices.find(s => s.id === selectedServiceId); // Buscar en downloadableServices para encontrar el objeto completo
            if (service) {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', `digital-service-price-${service.id}`);
                label.textContent = `Precio de ${service.name || `ID: ${service.id}`}:`;
                formGroup.appendChild(label);

                const input = document.createElement('input');
                input.type = 'number';
                input.id = `digital-service-price-${service.id}`;
                input.min = '0';
                input.step = '100';
                input.dataset.serviceId = service.id; 
                input.value = service.price;
                formGroup.appendChild(input);

                elements.selectedDigitalServicePriceInputContainer.innerHTML = '';
                elements.selectedDigitalServicePriceInputContainer.appendChild(formGroup);
            }
        }
    }

    /**
     * Guarda el precio del servicio digital seleccionado.
     */
    function saveDigitalServicePrice() {
        const selectedServiceId = elements.digitalServiceSelect ? elements.digitalServiceSelect.value : null;
        if (!selectedServiceId) {
            if (elements.priceUpdateMessage) {
                elements.priceUpdateMessage.textContent = 'Por favor, selecciona un servicio digital para guardar su precio.';
                elements.priceUpdateMessage.style.color = 'var(--accent-color)';
            }
            return;
        }

        if (elements.selectedDigitalServicePriceInputContainer) {
            const servicePriceInput = elements.selectedDigitalServicePriceInputContainer.querySelector(`input[data-service-id="${selectedServiceId}"]`);
            if (servicePriceInput) {
                const newPrice = parseFloat(servicePriceInput.value);
                if (isNaN(newPrice) || newPrice < 0) {
                    if (elements.priceUpdateMessage) {
                        elements.priceUpdateMessage.textContent = 'Por favor, introduce un número positivo válido para el precio del servicio digital seleccionado.';
                        elements.priceUpdateMessage.style.color = 'var(--accent-color)';
                    }
                    servicePriceInput.style.borderColor = 'var(--accent-color)';
                    return;
                } else {
                    const serviceToUpdate = downloadableServices.find(s => s.id === selectedServiceId);
                    const serviceToUpdateInDigitalOnly = digitalServicesOnly.find(s => s.id === selectedServiceId);
                    
                    if (serviceToUpdate) {
                        serviceToUpdate.price = newPrice;
                        localStorage.setItem(`digitalPromotionPrice_${selectedServiceId}`, newPrice); 
                        console.log(`DEBUG: Precio de servicio digital actualizado en downloadableServices: ${selectedServiceId}, Nuevo Precio: ${newPrice}`); // DEBUG
                        
                        // Si también está en digitalServicesOnly, actualizarlo allí
                        if (serviceToUpdateInDigitalOnly) {
                            serviceToUpdateInDigitalOnly.price = newPrice;
                            console.log(`DEBUG: Precio de servicio digital actualizado en digitalServicesOnly: ${selectedServiceId}, Nuevo Precio: ${newPrice}`); // DEBUG
                        }

                        servicePriceInput.style.borderColor = '';
                        if (elements.priceUpdateMessage) {
                            elements.priceUpdateMessage.textContent = 'Precio del servicio digital guardado correctamente.';
                            elements.priceUpdateMessage.style.color = 'var(--whatsapp-color)';
                            setTimeout(() => {
                                if (elements.priceUpdateMessage) elements.priceUpdateMessage.textContent = '';
                            }, 3000);
                        }
                        renderDigitalServices(elements.digitalServicesGrid, digitalServicesOnly); // Re-render digital services
                        updateSelectionUI(); 
                    } else {
                        console.error(`ERROR: No se encontró el servicio digital con ID ${selectedServiceId} en downloadableServices para actualizar.`); // DEBUG
                    }
                }
            }
        }
    }


    function openAdminPanel() {
        if (!elements.adminPanel) {
            console.error("ERROR: No se encontró el elemento del Panel de Administración. No se puede abrir.");
            return;
        }
        elements.adminPanel.classList.add('open');
        elements.adminPanel.style.display = 'flex';
        setBodyNoScroll();

        if (elements.priceUpdateMessage) elements.priceUpdateMessage.textContent = '';
        
        // DEBUG: Checking admin link buttons before setting style.
        console.log("DEBUG: Type of elements.copyAdminDownloadLinkBtn:", typeof elements.copyAdminDownloadLinkBtn, "Value:", elements.copyAdminDownloadLinkBtn);
        console.log("DEBUG: Type of elements.whatsappAdminDownloadLinkBtn:", typeof elements.whatsappAdminDownloadLinkBtn, "Value:", elements.whatsappAdminDownloadLinkBtn);

        if (elements.generatedDownloadLinkOutput) elements.generatedDownloadLinkOutput.style.display = 'none';
        // Añadir una verificación más robusta aquí si el error persiste
        if (elements.copyAdminDownloadLinkBtn && typeof elements.copyAdminDownloadLinkBtn.style !== 'undefined') { 
            elements.copyAdminDownloadLinkBtn.style.display = 'none';
        } else {
            console.warn("WARN: elements.copyAdminDownloadLinkBtn no tiene propiedad 'style' o es nulo/indefinido.");
        }
        if (elements.whatsappAdminDownloadLinkBtn && typeof elements.whatsappAdminDownloadLinkBtn.style !== 'undefined') {
            elements.whatsappAdminDownloadLinkBtn.style.display = 'none';
        } else {
            console.warn("WARN: elements.whatsappAdminDownloadLinkBtn no tiene propiedad 'style' o es nulo/indefinido.");
        }

        // Populate all dropdowns
        populateFeaturedPromotionSelect();
        populateStoreProductSelect();
        populateDigitalServiceSelect(); 

        if (!window.location.hash.startsWith('#admin_panel?ids=')) {
            const adminPanelContent = elements.adminPanel.querySelector('.admin-panel-content');
            if (adminPanelContent) {
                adminPanelContent.scrollTop = 0;
            }
        }
    }

    function closeAdminPanel() {
        if (elements.adminPanel) {
            elements.adminPanel.classList.remove('open');
            elements.adminPanel.style.display = 'none';
            removeBodyNoScroll();
        }
    }

    /**
     * Muestra/oculta los detalles del método de pago.
     * @param {boolean} showMercadoPago - Verdadero para mostrar Mercado Pago, falso para Transferencia Bancaria.
     * (Esta función ahora solo gestiona la visualización de Mercado Pago, ya que Transferencia Bancaria fue eliminada)
     */
    function togglePaymentDetails(showMercadoPago) {
        if (!elements.mercadoPagoDetails || !elements.paymentTotalAmount || !elements.mpAliasDisplay) return;

        elements.mpAliasDisplay.textContent = CONFIG.MERCADO_PAGO_ALIAS;
        // elements.bankAliasDisplay.textContent = CONFIG.MERCADO_PAGO_ALIAS; // Eliminado

        // Siempre mostramos Mercado Pago, ya no hay toggle
        elements.mercadoPagoDetails.style.display = 'block';
        // elements.bankTransferDetails.style.display = 'none'; // Eliminado
        
        const { total } = calculateTotalPrice();
        elements.paymentTotalAmount.textContent = formatCurrency(total);
        // elements.paymentTotalAmountTransfer.textContent = formatCurrency(total); // Eliminado
    }

    // --- Funciones para gestionar el estado de no-scroll del cuerpo ---
    function setBodyNoScroll() {
        document.body.classList.add('no-scroll');
    }

    function removeBodyNoScroll() {
        if (!(elements.selectionPanel && elements.selectionPanel.classList.contains('open')) &&
            !(elements.paymentModal && elements.paymentModal.classList.contains('open')) &&
            !(elements.adminPanel && elements.adminPanel.classList.contains('open')) &&
            !(elements.lightbox && elements.lightbox.classList.contains('open'))
        ) {
            document.body.classList.remove('no-scroll');
        }
    }


    // --- Funcionalidad de Descarga del Cliente ---

    /**
     * Controla la visibilidad de los elementos de la página principal versus la sección de descarga.
     * @param {boolean} showMain - Verdadero para mostrar los elementos de la página principal, falso para mostrar solo la sección de descarga.
     */
    function setMainPageDisplay(showMain) {
        const mainSections = [
            elements.heroSection,
            document.getElementById('offers'),
            elements.servicesSection,
            elements.productsSection,
            elements.contactSection,
            elements.footer,
            document.getElementById('about')
        ];
        const panelsAndModals = [
            elements.mobileMenu,
            elements.selectionPanel,
            elements.paymentModal,
            elements.adminPanel
        ];
        const floatingElements = [
            elements.header,
            elements.selectionIcon,
            elements.whatsappFloatBtn
        ];

        mainSections.forEach(section => {
            if (section) {
                section.style.display = showMain ? 'block' : 'none';
            }
        });

        panelsAndModals.forEach(panel => {
            if (panel) {
                panel.classList.remove('open');
                panel.style.display = 'none';
            }
        });

        floatingElements.forEach(element => {
            if (element) {
                if (element === elements.selectionIcon) {
                    element.style.display = showMain && selectedItems.size > 0 ? 'block' : 'none';
                } else if (element === elements.whatsappFloatBtn) {
                    element.style.display = showMain ? 'flex' : 'none';
                } else if (element !== elements.openAdminPanelBtn) {
                    element.style.display = showMain ? 'block' : 'none';
                }
            }
        });
        if (showMain) {
            updateSelectionUI();
        }

        if (elements.downloadSection) {
            if (showMain) {
                elements.downloadSection.classList.remove('open-full');
                elements.downloadSection.style.display = 'none';
                removeBodyNoScroll(); 
            } else {
                elements.downloadSection.classList.add('open-full');
                elements.downloadSection.style.display = 'flex';
                document.body.classList.remove('no-scroll');
            }
        }
        if (elements.toastNotification && elements.toastNotification.classList.contains('show')) {
            elements.toastNotification.classList.remove('show');
        }
    }


    /**
     * Maneja el enrutamiento de la página basado en el hash de la URL.
     */
    function handleRouting() {
        const hash = window.location.hash;

        if (hash.startsWith('#download?ids=')) {
            setMainPageDisplay(false);
            
            const ids = hash.split('=')[1].split(',').map(id => id.trim()).filter(id => id !== '');

            // Filtrar solo los servicios que son verdaderamente descargables
            clientDownloadPhotos = downloadableServices.filter(service => ids.includes(service.id));
            
            if (clientDownloadPhotos.length > 0) {
                renderClientDownloadSection(clientDownloadPhotos);
                window.scrollTo(0, 0);
                showToast('¡Tus servicios digitales están listos para descargar!', 'success');
            } else {
                renderClientDownloadSection([]);
                console.warn('WARN: No se encontraron servicios digitales válidos para el enlace de descarga proporcionado. Es posible que se hayan pasado IDs de productos físicos o IDs inválidos.');
            }
        } else if (hash.startsWith('#admin_panel?ids=')) {
            // Esta parte ya no se activaría por el cliente, pero la mantenemos por si el admin la usa manualmente.
            setMainPageDisplay(true);

            const adminGenerateIds = hash.split('=')[1].split(',').map(id => id.trim()).filter(id => id !== '');
            const adminIdsString = adminGenerateIds.join(',');

            elements.selectionPanel.classList.remove('open');
            elements.paymentModal.classList.remove('open');
            elements.adminPanel.style.display = 'none';

            openAdminPanel();

            // Usar setTimeout para asegurar que el panel esté abierto y renderizado antes de intentar rellenar y hacer clic
            setTimeout(() => {
                const adminPanelContent = elements.adminPanel?.querySelector('.admin-panel-content');
                const targetHeader = elements.adminGenerateIdsSectionHeader;

                if (targetHeader) {
                    targetHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (adminPanelContent) {
                    adminPanelContent.scrollTop = 0;
                }

                if (elements.adminPhotoIdsInput) {
                    elements.adminPhotoIdsInput.value = adminIdsString;

                    if (elements.generateAdminDownloadLinkBtn) {
                        elements.generateAdminDownloadLinkBtn.click(); // Trigger the click to generate the link
                    }
                }
                showToast('IDs recibidos. Enlace de descarga generado automáticamente.', 'info');
            }, 500); // Pequeño retraso para asegurar que el DOM esté listo
        } else {
            setMainPageDisplay(true);
        }
    }

    /**
     * Renderiza los servicios digitales en la sección de descarga del cliente.
     * @param {Array<object>} servicesToRender - Array de objetos de servicio digital a mostrar.
     */
    function renderClientDownloadSection(servicesToRender) {
        if (!elements.downloadLinksContainer || !elements.downloadableContentWrapper || !elements.thankYouMessageDisplay || !elements.downloadSectionTitle || !elements.downloadSubtitle) {
            console.error("ERROR: One or more download section elements are missing from the DOM.");
            return;
        }

        elements.downloadLinksContainer.innerHTML = '';
        console.log(`DEBUG: renderClientDownloadSection intentando renderizar ${servicesToRender.length} servicios digitales.`);

        if (servicesToRender.length === 0) {
            elements.downloadableContentWrapper.style.display = 'none';
            elements.thankYouMessageDisplay.style.display = 'none';
            elements.downloadSectionTitle.textContent = '';
            elements.downloadSubtitle.textContent = '';
            elements.downloadAllBtn.style.display = 'none';
            elements.downloadSection.style.display = 'none';
            return;
        }

        if (servicesToRender.length === 1) {
            elements.downloadSectionTitle.textContent = '¡Tu servicio digital está listo!';
        } else {
            elements.downloadSectionTitle.textContent = '¡Tus servicios digitales están listos!';
        }
        elements.downloadSubtitle.textContent = 'Haz clic en cada elemento para descargarlo individualmente, o usa el botón para descargarlos todos de una vez.';

        elements.downloadableContentWrapper.style.display = 'block';
        elements.thankYouMessageDisplay.style.display = 'block';
        elements.downloadAllBtn.style.display = 'block';
        elements.downloadSection.style.display = 'flex';

        servicesToRender.forEach(service => {
            const downloadItem = document.createElement('div');
            downloadItem.className = 'download-item photo-card';
            downloadItem.dataset.id = service.id;

            let mediaHtml = '';
            if (service.type === 'video') {
                mediaHtml = `
                    <video src="${service.src}" controls muted loop playsinline preload="metadata" style="width: 100%; height: 220px; object-fit: cover;"></video>
                `;
            } else if (service.type === 'image') {
                mediaHtml = `<img src="${service.src}" alt="${service.name || `Servicio Digital ${service.id}`}" loading="lazy">`;
            } else if (service.type === 'pdf') {
                mediaHtml = `
                    <div class="file-icon-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #333;">
                        <i class="fas fa-file-pdf" style="font-size: 80px; color: var(--accent-color);"></i>
                        <p style="color: white; margin-top: 10px; font-size: 1.1rem; text-align: center;">${service.name || service.id}</p>
                    </div>
                `;
            } else if (service.type === 'powerpoint') {
                mediaHtml = `
                    <div class="file-icon-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #333;">
                        <i class="fas fa-file-powerpoint" style="font-size: 80px; color: orange;"></i>
                        <p style="color: white; margin-top: 10px; font-size: 1.1rem; text-align: center;">${service.name || service.id}</p>
                    </div>
                `;
            } else {
                 mediaHtml = `
                    <div class="file-icon-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background-color: #333;">
                        <i class="fas fa-file" style="font-size: 80px; color: var(--text-color);"></i>
                        <p style="color: white; margin-top: 10px; font-size: 1.1rem; text-align: center;">${service.name || service.id}</p>
                    </div>
                `;
            }


            downloadItem.innerHTML = `
                ${mediaHtml}
                <div class="photo-card-overlay">
                    <span class="photo-title">${service.name || `Servicio Digital ${service.id}`}</span>
                    <a href="${service.src}" download="${service.src.split('/').pop()}" class="btn btn-secondary download-btn">Descargar</a>
                </div>
            `;
            
            // Si es un archivo (PDF/PPT), el clic en la tarjeta también debería descargar
            if (service.type === 'pdf' || service.type === 'powerpoint') {
                const downloadLinkElement = downloadItem.querySelector('.download-btn');
                downloadItem.addEventListener('click', (e) => {
                    if (!e.target.closest('.download-btn')) {
                        downloadLinkElement.click(); // Simula el clic en el botón de descarga
                    }
                });
            }


            elements.downloadLinksContainer.appendChild(downloadItem);
        });
    }

    /**
     * Genera y muestra un enlace de descarga compartible para los "servicios digitales" actualmente seleccionados (desde el carrito).
     * (Funcionalidad de administrador)
     */
    function generateClientDownloadLink() {
        // Filtrar solo los ítems que son verdaderos servicios digitales (de downloadableServices)
        const servicesInCart = Array.from(selectedItems.values()).filter(item => 
            item.type === 'photo' && 
            item.quantity > 0 &&
            item.itemData.originalCategoryName === 'Servicios-Digitales' // Asegurarse de que sea de la categoría de archivos digitales
        );

        if (servicesInCart.length === 0) {
            showToast('No hay servicios digitales seleccionados para generar un enlace de descarga.', 'info');
            return;
        }

        const serviceIds = [];
        servicesInCart.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                serviceIds.push(item.originalId);
            }
        });

        const downloadUrl = generateDownloadUrlFromIds(serviceIds.join(','), 'download');

        lastGeneratedDownloadLink = downloadUrl;

        showToast('Enlace de descarga generado:', 'info');
        
        let copySuccess = false;
        try {
            const dummyInput = document.createElement('textarea');
            document.body.appendChild(dummyInput);
            dummyInput.value = downloadUrl;
            dummyInput.select();
            copySuccess = document.execCommand('copy');
            document.body.removeChild(dummyInput);
        } catch (err) {
            console.error('ERROR: Fallo al copiar al portapapeles:', err);
            copySuccess = false;
        }

        if (copySuccess) {
            showToast('¡Enlace copiado al portapapeles! Compártelo con el cliente.', 'success');
        } else {
            showToast('El enlace no pudo copiarse automáticamente. Cópialo manualmente del cuadro de texto.', 'warn');
        }

        // Ya no se cierra el panel de selección automáticamente, el admin lo hará manualmente.
        // if (elements.selectionPanel) elements.selectionPanel.classList.remove('open');
        // elements.selectionPanel.style.display = 'none';
        // removeBodyNoScroll();
    }

    /**
     * Genera la URL principal de descarga a partir de una cadena de IDs separada por comas.
     * @param {string} itemIdsString - Cadena de IDs de ítems (servicios digitales) separada por comas.
     * @param {string} type - 'download' para el cliente, 'admin_panel' para el enlace del admin.
     * @returns {string} La URL completa con hash.
     */
    function generateDownloadUrlFromIds(itemIdsString, type) {
        if (!itemIdsString || itemIdsString.trim() === '') {
            return '';
        }
        const baseUrl = window.location.origin === 'null' || window.location.origin === 'file://'
                        ? 'http://localhost:8000'
                        : window.location.origin;
        const basePath = window.location.pathname; 
        return `${baseUrl}${basePath}#${type}?ids=${itemIdsString}`;
    }

    /**
     * Genera un enlace de descarga a partir de los IDs introducidos en el panel de administración.
     */
    function generateAdminDownloadLink() {
        if (!elements.adminPhotoIdsInput || !elements.generatedDownloadLinkOutput || !elements.copyAdminDownloadLinkBtn || !elements.whatsappAdminDownloadLinkBtn) return;

        const idsInput = elements.adminPhotoIdsInput.value.trim();
        if (idsInput === '') {
            showToast('Por favor, introduce al menos un ID de servicio digital para generar el enlace.', 'info');
            elements.generatedDownloadLinkOutput.style.display = 'none';
            elements.copyAdminDownloadLinkBtn.style.display = 'none';
            elements.whatsappAdminDownloadLinkBtn.style.display = 'none';
            return;
        }

        const itemIdsArray = idsInput.split(',').map(id => id.trim()).filter(id => id !== '');
        if (itemIdsArray.length === 0) {
            showToast('Los IDs ingresados no son válidos. Asegúrate de separarlos por comas.', 'error');
            elements.generatedDownloadLinkOutput.style.display = 'none';
            elements.copyAdminDownloadLinkBtn.style.display = 'none';
            elements.whatsappAdminDownloadLinkBtn.style.display = 'none';
            return;
        }

        // Filtrar solo los IDs que corresponden a servicios digitales válidos
        const validDownloadableIds = downloadableServices.filter(service => itemIdsArray.includes(service.id) && service.originalCategoryName === 'Servicios-Digitales').map(service => service.id);

        if (validDownloadableIds.length === 0) {
            showToast('Ninguno de los IDs ingresados corresponde a un servicio digital descargable.', 'error');
            elements.generatedDownloadLinkOutput.style.display = 'none';
            elements.copyAdminDownloadLinkBtn.style.display = 'none';
            elements.whatsappAdminDownloadLinkBtn.style.display = 'none';
            return;
        }

        const cleanIdsString = validDownloadableIds.join(',');

        const downloadUrl = generateDownloadUrlFromIds(cleanIdsString, 'download');

        lastGeneratedDownloadLink = downloadUrl;

        elements.generatedDownloadLinkOutput.textContent = downloadUrl;
        elements.generatedDownloadLinkOutput.style.display = 'block';
        elements.copyAdminDownloadLinkBtn.style.display = 'block';
        elements.whatsappAdminDownloadLinkBtn.style.display = 'block';

        showToast('Enlace de descarga generado en el panel.', 'success');
    }

    /**
     * Copia el último enlace de descarga generado al portapapeles (desde el Panel de Administración).
     */
    function copyAdminDownloadLink() {
        if (!lastGeneratedDownloadLink) {
            showToast('Primero genera un enlace de descarga.', 'info');
            return;
        }

        let copySuccess = false;
        try {
            const dummyInput = document.createElement('textarea');
            document.body.appendChild(dummyInput);
            dummyInput.value = lastGeneratedDownloadLink;
            dummyInput.select();
            copySuccess = document.execCommand('copy');
            document.body.removeChild(dummyInput);
        } catch (err) {
            console.error('ERROR: Fallo al copiar al portapapeles:', err);
            copySuccess = false;
        }

        if (copySuccess) {
            showToast('¡Enlace copiado al portapapeles! Listo para enviar.', 'success');
        } else {
            showToast('El enlace no pudo copiarse automáticamente. Cópialo manualmente del cuadro de texto.', 'warn');
        }
    }

    /**
     * Abre WhatsApp para enviar el último enlace de descarga generado (desde el Panel de Administración).
     */
    function whatsappAdminDownloadLink() {
        if (!lastGeneratedDownloadLink) {
            showToast('Primero genera un enlace de descarga.', 'info');
            return;
        }

        const message = encodeURIComponent(`¡Hola! Aquí tienes el enlace para descargar tus servicios digitales de Recuerdos de Papel: ${lastGeneratedDownloadLink}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
        showToast('Mensaje de WhatsApp preparado. Selecciona el contacto.', 'info');
    }

    /**
     * Inicia la descarga de todos los servicios digitales en la sección de descarga del cliente.
     */
    function downloadAllPhotos() {
        if (clientDownloadPhotos.length === 0) {
            showToast('No hay servicios digitales para descargar.', 'info');
            return;
        }

        showToast('Iniciando descarga de todos los servicios digitales...', 'info');
        clientDownloadPhotos.forEach((service, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = service.src;
                link.download = service.src.split('/').pop();
                document.body.appendChild(link);
                link.click();
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            }, index * 100);
        });
        showToast('¡Descargas iniciadas!', 'success');
    }


    // --- Inicialización de la Aplicación Principal ---
    async function init() {
        console.log("DEBUG: Inicializando script de Recuerdos de Papel...");

        // Referencia a lightboxContent después de que el DOM esté cargado
        elements.lightboxContent = elements.lightbox.querySelector('.lightbox-content');

        loadSelectionFromLocalStorage();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin') && urlParams.get('admin') === 'true') {
            if (elements.openAdminPanelBtn) {
                elements.openAdminPanelBtn.style.display = 'block';
            }
        } else {
            if (elements.openAdminPanelBtn) {
                elements.openAdminPanelBtn.style.display = 'none';
            }
        }

        const heroSection = elements.heroSection;
        const initialBgStyle = heroSection ? window.getComputedStyle(heroSection).backgroundImage : 'none';
        if (initialBgStyle && initialBgStyle !== 'none' && heroSection) {
            const urlMatch = initialBgStyle.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
                const initialImageUrl = urlMatch[1];
                const baseImageUrl = initialImageUrl.substring(0, initialImageUrl.lastIndexOf('.'));
                const primaryExtension = initialImageUrl.substring(initialImageUrl.lastIndexOf('.'));
                const fallbackExtension = '.jpg';
                const secondaryFallbackExtension = '.png';

                const loadImageWithFallback = (baseUrl, extensions, element, index = 0) => {
                    if (index >= extensions.length) {
                        console.error(`ERROR: No se pudo cargar el fondo del héroe con ninguna extensión probada: ${baseUrl}`);
                        return;
                    }
                    const currentUrl = `${baseUrl}${extensions[index]}`;
                    const img = new Image();
                    img.onload = () => {
                        element.style.backgroundImage = `url('${currentUrl}')`;
                    };
                    img.onerror = () => {
                        loadImageWithFallback(baseUrl, extensions, element, index + 1);
                    };
                    img.src = currentUrl;
                };
                loadImageWithFallback(baseImageUrl, [primaryExtension, fallbackExtension, secondaryFallbackExtension], heroSection);
            }
        } else {
             console.warn("WARN: No se encontró la imagen de fondo inicial en la sección del héroe o heroSection es nulo. Asegúrate de definirla en index.html.");
        }

        await loadDataFromJSON();

        handleRouting();
        window.addEventListener('hashchange', handleRouting);


        // --- Escuchadores de Eventos ---
        if (elements.menuToggle) elements.menuToggle.addEventListener('click', () => {
            if (elements.mobileMenu) elements.mobileMenu.classList.add('open');
            setBodyNoScroll();
        });
        if (elements.closeMenuBtn) elements.closeMenuBtn.addEventListener('click', () => {
            if (elements.mobileMenu) elements.mobileMenu.classList.remove('open');
            removeBodyNoScroll();
        });
        elements.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (elements.mobileMenu) elements.mobileMenu.classList.remove('open');
                removeBodyNoScroll();
            });
        });

        window.addEventListener('scroll', () => {
            if (elements.header) {
                if (window.scrollY > 50) {
                    elements.header.classList.add('sticky');
                } else {
                    elements.header.classList.remove('sticky');
                }
            }
        });

        if (elements.lightboxClose) elements.lightboxClose.addEventListener('click', closeLightbox);
        if (elements.lightboxPrev) elements.lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        if (elements.lightboxNext) elements.lightboxNext.addEventListener('click', () => navigateLightbox(1));

        if (elements.selectionIcon) elements.selectionIcon.addEventListener('click', () => {
            if (elements.selectionPanel) elements.selectionPanel.classList.add('open');
            elements.selectionPanel.style.display = 'flex';
            setBodyNoScroll();
            updateSelectionUI();
        });
        if (elements.closeSelectionPanelBtn) elements.closeSelectionPanelBtn.addEventListener('click', () => {
            if (elements.selectionPanel) elements.selectionPanel.classList.remove('open');
            elements.selectionPanel.style.display = 'none';
            removeBodyNoScroll();
        });
        if (elements.clearSelectionBtn) elements.clearSelectionBtn.addEventListener('click', clearSelection);

        if (elements.whatsappBtn) elements.whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedItems.size === 0) {
                showToast('Tu selección está vacía. ¡Añade ítems para continuar!', 'info');
                return;
            }
            if (elements.paymentModal) {
                elements.paymentModal.classList.add('open');
                elements.paymentModal.style.display = 'flex';
                // Log para verificar el estado del botón al abrir el modal
                console.log("DEBUG: Modal de pago abierto. Estado del botón whatsapp-payment-btn:", elements.whatsappPaymentBtn ? elements.whatsappPaymentBtn.style.display : 'No encontrado');
                // FORZAR DISPLAY: BLOCK PARA EL BOTÓN DE PAGO
                if (elements.whatsappPaymentBtn) {
                    elements.whatsappPaymentBtn.style.display = 'block';
                    console.log("DEBUG: whatsapp-payment-btn display forzado a 'block'.");
                }
            }
            setBodyNoScroll();
            // Ya no hay toggle, siempre mostramos Mercado Pago
            togglePaymentDetails(true); 
            // if (elements.paymentMethodToggle) elements.paymentMethodToggle.checked = false; // Eliminado
        });

        if (elements.whatsappFloatBtn) {
            elements.whatsappFloatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Updated message for general WhatsApp contact
                window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! Tengo una consulta general sobre sus servicios de Recuerdos de Papel.')}`, '_blank');
            });
        }

        if (elements.closePaymentModalBtn) elements.closePaymentModalBtn.addEventListener('click', () => {
            if (elements.paymentModal) elements.paymentModal.classList.remove('open');
            elements.paymentModal.style.display = 'none';
            removeBodyNoScroll();
        });
        // if (elements.paymentMethodToggle) elements.paymentMethodToggle.addEventListener('change', (event) => { // Eliminado
        //     togglePaymentDetails(!event.target.checked);
        // });
        if (elements.whatsappPaymentBtn) { // Asegurarse de que el elemento exista antes de añadir el listener
            elements.whatsappPaymentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("DEBUG: Botón 'Ya Pagué / Coordinar' clickeado."); // DEBUG: Log para confirmar el clic
                const whatsappUrl = generateWhatsAppMessage(); // Ahora solo devuelve la URL de WhatsApp
                
                // Abre WhatsApp en una nueva pestaña/ventana
                window.open(whatsappUrl, '_blank');

                clearSelection(); // Limpia el carrito una vez que el mensaje ha sido generado
                showToast('¡Gracias! Hemos generado el mensaje para WhatsApp. Por favor, revísalo y envíalo.', 'success');
            });
        } else {
            console.error("ERROR: No se encontró el botón 'whatsapp-payment-btn' para adjuntar el event listener.");
        }

        if (elements.openAdminPanelBtn) elements.openAdminPanelBtn.addEventListener('click', openAdminPanel);
        if (elements.closeAdminPanelBtn) elements.closeAdminPanelBtn.addEventListener('click', closeAdminPanel);
        
        // Admin Panel Price Saving Listeners
        if (elements.saveFeaturedPromotionPriceBtn) elements.saveFeaturedPromotionPriceBtn.addEventListener('click', saveFeaturedPromotionPrice);
        if (elements.saveStoreProductPricesBtn) elements.saveStoreProductPricesBtn.addEventListener('click', saveStoreProductPrices);
        if (elements.saveDigitalServicePriceBtn) elements.saveDigitalServicePriceBtn.addEventListener('click', saveDigitalServicePrice);

        // Admin Panel Dropdown Change Listeners
        if (elements.featuredPromotionSelect) elements.featuredPromotionSelect.addEventListener('change', displaySelectedFeaturedPromotionPriceInput);
        if (elements.storeProductSelect) elements.storeProductSelect.addEventListener('change', displaySelectedStoreProductPriceInput);
        if (elements.digitalServiceSelect) elements.digitalServiceSelect.addEventListener('change', displaySelectedDigitalServiceInput); // Llamar a la función correcta
        
        if (elements.generateAdminDownloadLinkBtn) elements.generateAdminDownloadLinkBtn.addEventListener('click', generateAdminDownloadLink);
        if (elements.copyAdminDownloadLinkBtn) elements.copyAdminDownloadLinkBtn.addEventListener('click', copyAdminDownloadLink);
        if (elements.whatsappAdminDownloadLinkBtn) elements.whatsappAdminDownloadLinkBtn.addEventListener('click', whatsappAdminDownloadLink);
        
        document.addEventListener('keydown', (e) => {
            if (elements.lightbox && elements.lightbox.classList.contains('open')) {
                if (e.key === 'ArrowLeft') {
                    navigateLightbox(-1);
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    navigateLightbox(1);
                    e.preventDefault();
                } else if (e.key === 'Escape') {
                    closeLightbox();
                    e.preventDefault();
                }
            } else if (elements.paymentModal && elements.paymentModal.classList.contains('open') && e.key === 'Escape') {
                if (elements.paymentModal) elements.paymentModal.classList.remove('open');
                elements.paymentModal.style.display = 'none';
                removeBodyNoScroll();
                e.preventDefault();
            } else if (elements.selectionPanel && elements.selectionPanel.classList.contains('open') && e.key === 'Escape') {
                if (elements.selectionPanel) elements.selectionPanel.classList.remove('open');
                elements.selectionPanel.style.display = 'none';
                removeBodyNoScroll();
                e.preventDefault();
            } else if (elements.adminPanel && elements.adminPanel.classList.contains('open') && e.key === 'Escape') {
                closeAdminPanel();
                e.preventDefault();
            }
        });

        document.addEventListener('click', (event) => {
            if (elements.selectionPanel && elements.selectionPanel.classList.contains('open')) {
                const isClickInsidePanel = elements.selectionPanel.contains(event.target);
                const isClickOnSelectionIcon = elements.selectionIcon && elements.selectionIcon.contains(event.target);
                
                if (!isClickInsidePanel && !isClickOnSelectionIcon) {
                    if (elements.selectionPanel) elements.selectionPanel.classList.remove('open');
                    elements.selectionPanel.style.display = 'none';
                    removeBodyNoScroll();
                }
            }
            if (elements.paymentModal && elements.paymentModal.classList.contains('open')) {
                const modalContent = elements.paymentModal.querySelector('.payment-modal-content');
                const isClickOutsideContent = !modalContent.contains(event.target);
                const isClickOnWhatsappBtn = elements.whatsappBtn && elements.whatsappBtn.contains(event.target);
                
                if (event.target === elements.paymentModal || (isClickOutsideContent && !isClickOnWhatsappBtn)) {
                    if (elements.paymentModal) elements.paymentModal.classList.remove('open');
                    elements.paymentModal.style.display = 'none';
                    removeBodyNoScroll();
                }
            }

            if (elements.adminPanel && elements.adminPanel.classList.contains('open')) {
                const isClickInsideAdminPanel = elements.adminPanel.contains(event.target);
                const isClickOnAdminOpenBtn = elements.openAdminPanelBtn && elements.openAdminPanelBtn.contains(event.target);
                
                // Check if click is on any of the admin panel's interactive elements
                const isClickOnGenerateAdminLinkBtn = elements.generateAdminDownloadLinkBtn && elements.generateAdminDownloadLinkBtn.contains(event.target);
                const isClickOnCopyAdminLinkBtn = elements.copyAdminLinkBtn && elements.copyAdminLinkBtn.contains(event.target);
                const isClickOnWhatsappAdminLinkBtn = elements.whatsappAdminDownloadLinkBtn && elements.whatsappAdminDownloadLinkBtn.contains(event.target);
                
                const isClickOnSaveFeaturedPromotionPriceBtn = elements.saveFeaturedPromotionPriceBtn && elements.saveFeaturedPromotionPriceBtn.contains(event.target);
                const isClickOnFeaturedPromotionSelect = elements.featuredPromotionSelect && elements.featuredPromotionSelect.contains(event.target);

                const isClickOnSaveStoreProductPricesBtn = elements.saveStoreProductPricesBtn && elements.saveStoreProductPricesBtn.contains(event.target);
                const isClickOnStoreProductSelect = elements.storeProductSelect && elements.storeProductSelect.contains(event.target);

                const isClickOnSaveDigitalServicePriceBtn = elements.saveDigitalServicePriceBtn && elements.saveDigitalServicePriceBtn.contains(event.target);
                const isClickOnDigitalServiceSelect = elements.digitalServiceSelect && elements.digitalServiceSelect.contains(event.target);
                
                if (!isClickInsideAdminPanel && !isClickOnAdminOpenBtn &&
                    !isClickOnGenerateAdminLinkBtn && !isClickOnCopyAdminLinkBtn && 
                    !isClickOnWhatsappAdminLinkBtn && 
                    !isClickOnSaveFeaturedPromotionPriceBtn && !isClickOnFeaturedPromotionSelect &&
                    !isClickOnSaveStoreProductPricesBtn && !isClickOnStoreProductSelect &&
                    !isClickOnSaveDigitalServicePriceBtn && !isClickOnDigitalServiceSelect) { 
                    closeAdminPanel(); 
                }
            }
        });

        document.addEventListener('contextmenu', (event) => {
            if (elements.selectionPanel && elements.selectionPanel.classList.contains('open')) {
                event.preventDefault();
                if (elements.selectionPanel) elements.selectionPanel.classList.remove('open');
                elements.selectionPanel.style.display = 'none';
                removeBodyNoScroll();
            }
            if (elements.adminPanel && elements.adminPanel.classList.contains('open')) {
                event.preventDefault();
                closeAdminPanel();
            }
        });
        
        if (elements.downloadAllBtn) elements.downloadAllBtn.addEventListener('click', downloadAllPhotos);
        
        console.log("DEBUG: init() completado y escuchadores configurados.");
    }

    init();
});
