// public/script.js
async function cargarDatos() {
    const fileInput = document.getElementById('fileInput').files[0];
    if (!fileInput) {
        console.log("No se ha seleccionado un archivo.");
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput);

    console.log("Enviando archivo...");

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        
        if (!response.ok) {
            throw new Error('Error al cargar los datos.');
        }

        const data = await response.json();
        mostrarDatos(data);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}
//==================================Mostrar Datos===================================================================//

// Mostrar Datos con filtro por fechas
function mostrarDatos(data) {
    const table = document.getElementById('results-table');
    const tableBody = table.querySelector('tbody');
    tableBody.innerHTML = ''; // Limpiar el contenido de la tabla antes de agregar nuevos datos

    // Función para convertir fechas de Excel a formato 'dd/mm/yyyy'
    function convertirFechaExcel(fechaExcel) {
        if (!fechaExcel) return null;
        const fecha = new Date((fechaExcel - 25569) * 86400 * 1000); // Fórmula de conversión
        const fechaUTC = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes(), fecha.getSeconds()));
        return fechaUTC.toLocaleDateString('es-CL'); // Formato dd/mm/yyyy en español
    }

    // Función para convertir fecha del filtro de 'yyyy-mm-dd' a 'dd/mm/yyyy'
    function convertirFechaInput(fechaInput) {
        const partes = fechaInput.split('-');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    // Obtener las fechas seleccionadas en el filtro
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    console.log("Fecha de Inicio seleccionada:", startDate);  // Mostrar la fecha de inicio
    console.log("Fecha de Fin seleccionada:", endDate);  // Mostrar la fecha de fin

    // Convertir las fechas de entrada a formato 'dd/mm/yyyy'
    const startDateFormatted = convertirFechaInput(startDate);
    const endDateFormatted = convertirFechaInput(endDate);

    console.log("Fecha de Inicio en formato 'dd/mm/yyyy':", startDateFormatted);
    console.log("Fecha de Fin en formato 'dd/mm/yyyy':", endDateFormatted);

    // Convertir las fechas seleccionadas a objetos Date
    const startDateObj = new Date(startDateFormatted.split('/').reverse().join('-')); // Convertir a Date (dd/mm/yyyy -> yyyy-mm-dd)
    const endDateObj = new Date(endDateFormatted.split('/').reverse().join('-')); // Convertir a Date (dd/mm/yyyy -> yyyy-mm-dd)

    // Asegurarse de que la fecha de inicio comience a las 00:00:00
    startDateObj.setHours(0, 0, 0, 0); // Hora en 00:00:00

    // Asegurarse de que la fecha de fin termine a las 23:59:59
    endDateObj.setHours(23, 59, 59, 999); // Hora en 23:59:59

    let filteredData = [];

    data.forEach(row => {
        // Obtener la fecha de publicación en formato 'dd/mm/yyyy'
        const fechaPublicacion = row['Fecha Publicación'] ? convertirFechaExcel(row['Fecha Publicación']) : null;
        const fechaPublicacionObj = row['Fecha Publicación'] ? new Date((row['Fecha Publicación'] - 25569) * 86400 * 1000) : null;
        //Fecha cierre
        const fechaCierre = row['Fecha Cierre'] ? convertirFechaExcel(row['Fecha Cierre']) : null;
        const fechaCierreObj = row['Fecha Cierre'] ? new Date((row['Fecha Cierre'] - 25569) * 86400 * 1000) : null;

        // Mostrar la fecha de publicación en consola
        console.log(`Fecha de Publicación para la fila: ${fechaPublicacion}`);

        // Verificar si "Fecha Publicación" está dentro del rango
        if (fechaPublicacionObj && fechaPublicacionObj >= startDateObj && fechaPublicacionObj <= endDateObj) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row['Numero Adquisición'] || 'N/A'}</td>
                <td>${row['Nombre Adquisición'] || 'N/A'}</td>
                <td>${row['Organismo'] || 'N/A'}</td>
                <td>${fechaPublicacion || 'N/A'}</td>
                <td>${fechaCierre || 'N/A'}</td>
            `;
            tableBody.appendChild(tr);
            filteredData.push(row);
        }
    });

    console.log(`Cantidad de datos filtrados: ${filteredData.length}`);

    // Filtro por Nivel 1
    const niveles1Filtro = [
        "Consultoría", "Educación, Formación, entrenamiento y capacitación", "Obras", 
        "Obras MINV", "Organizaciones y consultorías políticas, demográficas, económicas, sociales y de administración pública", 
        "Servicios agrícolas, pesqueros, forestales y relacionados con la fauna", 
        "Servicios basados en ingeniería, ciencias sociales y tecnología de la información", 
        "Servicios básicos y de información pública", "Servicios de construcción y mantenimiento", 
        "Servicios de limpieza industrial", "Servicios de perforación de minería, petróleo y gas", 
        "Servicios de producción y fabricación industrial", "Servicios editoriales, de diseño, publicidad, gráficos y artistas", 
        "Servicios financieros, pensiones y seguros", "Servicios medioambientales", 
        "Servicios profesionales, administrativos y consultorías de gestión empresarial", 
        "Tecnologías de la información, telecomunicaciones y radiodifusión", "Telecomunicaciones"
    ];
    //Filtro por Nivel 2
    const niveles2Filtro = [
        "Banca e Inversiones",
        "Construcción de edificios en general",
        "Consultoría",
        "Consultorías o asesoría en gestión empresarial",
        "Desarrollo social, demográfico y comunitario",
        "Finanzas para el desarrollo",
        "Gestión medioambiental",
        "Metodologías y tecnologías para mejorar la producción y la fabricación",
        "Obras",
        "Obras mayores",
        "Obras menores",
        "Obras MINVU",
        "Operaciones de transporte",
        "Servicios de apoyo a la administración de empresas",
        "Servicios de apoyo o soporte a la fabricación",
        "Servicios de atención, mantenimiento y reparaciones de edificios",
        "Servicios de minería",
        "Servicios de recursos humanos",
        "Servicios educativos especializados",
        "Servicios informáticos",
        "Servicios inmobiliarios",
        "Servicios profesionales de ingeniería",
        "Servicios relativos a la meteorología y ciencias de la tierra",
        "Servicios educativos complementarios",
        "Sistemas educativos complementarios",
        "Servicios de apoyo a la gestión",
        "Servicios de apoyo a la construcción",
        "Servicios de asesoría medioambiental",
        "Servicios de consultoría en gestión de empresas",
        "Servicios de datos",
        "Servicios de mantenimiento de terrenos",
        "Servicios de personal temporal",
        "Servicios de preparación de sitios",
        "Sistemas de información"
    ];
    //Filtro Nivel 3
    const niveles3Filtro = [
        "Cartografía",
        "Construcción de obras civiles y infraestructuras",
        "Consultoría",
        "Consultorías para el desarrollo de recursos humanos",
        "Contratación de personal",
        "Cultura",
        "Desarrollo social",
        "Desarrollo Regional",
        "Desarrollo urbano",
        "Diseño",
        "Empleo",
        "Estudios de ingeniería básica",
        "Evaluación de impacto ambiental",
        "Evaluación de programas",
        "Gestión de cadena de suministro o abastecimiento",
        "Gestión de proyectos",
        "Grupo 1",
        "Grupo 2",
        "Ingeniería civil",
        "Ingeniería de transportes",
        "Investigación de mercado",
        "Obras",
        "Obra menor",
        "Obra civil",
        "Obras MINVU",
        "Planificación medioambiental",
        "Personal técnico",
        "Servicios administrativos de terreno urbano",
        "Servicios de asesoría de ciencias medioambientales",
        "Servicios de asesoría de derecho medioambiental",
        "Servicios de Cooperación Técnica",
        "Servicios de evaluación de impacto ambiental (EIA)",
        "Servicios de gestión de la construcción",
        "Servicios de paisajismo, arquitectura paisajista",
        "Servicios de planificación de desarrollo urbano",
        "Servicios de promoción cultural",
        "Servicios temporales de ingeniería"
    ];

    //Filtro Generico
    const genericoFiltro = [
        "1era",
        "2°",
        "2da",
        "3°",
        "3 era A",
        "A",
        "B",
        "Asesorías en diseño organizacional",
        "Asesorías en gestión de proyectos",
        "Asesorías en planificación estratégica",
        "Construcción de obras civiles",
        "Control medioambiental",
        "Estudios de estructura social o servicios relacionados",
        "Estudios de factibilidad",
        "Estudios para localización de proyectos",
        "Evaluación económica o financiera de proyectos",
        "Formación, capacitación y entrenamiento de personal",
        "Gestión de recursos naturales o servicios de planificación estratégica de conservación",
        "Ingeniería arquitectónica",
        "Ingeniería de tránsito",
        "Ingeniería estructural",
        "Licitación privada de Obra MINVU",
        "Licitación Pública de Consultoría",
        "Licitación Pública de Obra",
        "Mano de obra temporal",
        "Mapeo",
        "Otras evaluaciones (gestión y diseño institucional)",
        "Planificación de estrategia de conservación marítima",
        "Profesionales"
    ];

    // Filtrar los datos por Nivel 1 (si se define un filtro)
    filteredData = filteredData.filter(row => {
        return niveles1Filtro.includes(row['Nivel 1']); // Filtrar por cualquier valor de 'Nivel 1' en el array
    });

    // Filtrar los datos por Nivel 2 (si se define un filtro)
    filteredData = filteredData.filter(row => {
        return niveles2Filtro.includes(row['Nivel 2']); // Filtrar por cualquier valor de 'Nivel 2' en el array
    });

    // Filtrar los datos por Nivel 3 (si se define un filtro)
    filteredData = filteredData.filter(row => {
        return niveles3Filtro.includes(row['Nivel 3']); // Filtrar por cualquier valor de 'Nivel 3' en el array
    });

    filteredData = filteredData.filter(row => {
        const genericoValue = row['Genérico'];  // Usamos 'Genérico' con la 'G' mayúscula
        if (genericoValue && genericoValue.trim) {
            const normalizedValue = genericoValue.trim().toLowerCase();
            return genericoFiltro.some(filtro => filtro.trim().toLowerCase() === normalizedValue);
        }
        return false;
    });
    
    console.log(filteredData); //
    console.log(`Cantidad de datos filtrados por Nivel 1: ${filteredData.length}`);
    console.log(`Cantidad de datos filtrados por Nivel 2: ${filteredData.length}`);
    console.log(`Cantidad de datos filtrados por Nivel 3: ${filteredData.length}`);
    console.log(`Cantidad de datos filtrados por GENÉRICO: ${filteredData.length}`);
    
      // Ahora se muestran los resultados filtrados en la tabla
    filteredData.forEach(row => {
        const fechaPublicacion = row['Fecha Publicación'] ? convertirFechaExcel(row['Fecha Publicación']) : 'N/A';
        const fechaCierre = row['Fecha Cierre'] ? convertirFechaExcel(row['Fecha Cierre']) : 'N/A';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Numero Adquisición'] || 'N/A'}</td>
            <td>${row['Nombre Adquisición'] || 'N/A'}</td>
            <td>${row['Organismo'] || 'N/A'}</td>
            <td>${fechaPublicacion}</td>
            <td>${fechaCierre}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    
    
    
    // Actualiza el contador de licitaciones filtradas
    document.getElementById('totalLicitaciones').textContent = filteredData.length;
     // Guardar los datos filtrados en una variable global para exportarlos
    window.filteredDataForExport = filteredData;
}


//================================Funcion exportar===================================================///
function exportarDatos() {
    // Usar los datos filtrados que se guardaron en la variable global
    const filteredData = window.filteredDataForExport;

    if (!filteredData || filteredData.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Crear el CSV, comenzando con las filas de encabezado
    const csvRows = [];
    const headers = ['Numero Adquisición', 'Nombre Adquisición', 'Organismo', 'Fecha Publicación', 'Fecha Cierre'];

    // Agregar los encabezados al CSV
    csvRows.push(headers.join(','));

    // Función para formatear las fechas a formato 'dd/mm/yyyy'
    function formatDate(dateValue) {
        if (dateValue) {
            let date;
            // Si la fecha ya es un objeto Date, la usamos directamente
            if (dateValue instanceof Date) {
                date = dateValue;
            } else {
                // Si la fecha está en formato Excel (numérica), convertimos a Date
                date = new Date((dateValue - 25569) * 86400 * 1000); // Excel date to JS Date
            }
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return 'N/A';
    }

    // Recorrer los datos filtrados y agregar las filas al CSV
    filteredData.forEach(row => {
        const fechaPublicacion = formatDate(row['Fecha Publicación']);
        const fechaCierre = formatDate(row['Fecha Cierre']);
        const rowData = [
            row['Numero Adquisición'] || 'N/A',
            row['Nombre Adquisición'] || 'N/A',
            row['Organismo'] || 'N/A',
            fechaPublicacion,
            fechaCierre
        ];
        csvRows.push(rowData.join(','));
    });

    // Crear un archivo CSV a partir de las filas
    const csvContent = csvRows.join('\n');

    // Crear un Blob con BOM para UTF-8
    const BOM = "\uFEFF"; // Byte Order Mark para UTF-8
    const csvWithBOM = BOM + csvContent;

    // Crear un blob con los datos CSV y especificar la codificación correcta
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

    // Crear un enlace para descargar el archivo CSV
    const link = document.createElement('a');
    if (link.download !== undefined) { // Soporte para navegadores modernos
        // Crear un enlace para descargar el archivo con el tipo adecuado para UTF-8
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'datos_filtrados.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}