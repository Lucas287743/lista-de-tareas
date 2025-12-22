document.addEventListener('DOMContentLoaded', (event) => {
    //variables que empiecen con '$', son elementos del DOM

    //ORDEN DEL CÓDIGO:
    //1.VARIABLES GLOBALES
    //2.FUNCIONES AUXILIARES (DOM)
    //3.FUNCIONES DE PERSISTENCIA
    //4.INICIO/CARGA
    //5.EVENTOS


    //1.VARIABLES GLOBALES
    let taskList = null; //array de objetos tarea
    const $taskList = document.getElementById('task-list');
    let $draggedItem = null; //fila que se está arrastrando
    const $addTaskBtn = document.getElementById('add-task-btn');



    //2.FUNCIONES AUXILIARES (DOM)

    function createRowElement(task) {
        const $row = document.createElement('tr');
        $row.setAttribute('draggable', 'true');

        // 1. Celda del Icono Mover (Handle)
        $row.appendChild(createHandleCell());

        // 2. Celda Hecho (Checkbox)
        const $checkboxTd = document.createElement('td');
        const $checkbox = document.createElement('input');
        $checkbox.type = 'checkbox';
        $checkbox.checked = task.done;
        $checkboxTd.appendChild($checkbox);
        $row.appendChild($checkboxTd);

        // 3. Celda Tarea
        $row.appendChild(createTextCell(task.text));

        // 4. Celda Fecha
        $row.appendChild(createTextCell(task.dueDate));

        // 5. Celda Hora
        $row.appendChild(createTextCell(task.dueTime));

        // 6. Celda Prioridad
        $row.appendChild(createTextCell(task.priority));

        // 7. Celda Acciones
        $row.appendChild(createActionCell());

        return $row;
    }



    function createHandleCell() {
        const $td = document.createElement('td');
        $td.className = 'col-mover drag-handle';

        const $icon = document.createElement('i');
        $icon.className = 'fa-solid fa-grip-vertical';


        $td.appendChild($icon);
        return $td;
    }

    function createTextCell(content) {
        const $td = document.createElement('td');
        $td.textContent = content;
        return $td;
    }

    function createActionCell() {
        const $td = document.createElement('td');
        $td.className = 'action-cell';

        const $button = document.createElement('button');
        $button.className = 'edit-btn';

        const $icon = document.createElement('i');
        $icon.className = 'fa-solid fa-pencil';

        $button.appendChild($icon);
        $td.appendChild($button);
        return $td;
    }


    // Llamar esta funcion después de cargar, eliminar, marcar/desmarcar como hechas las tareas.
    function checkEmptyState() {
        const $emptyState = document.getElementById('empty-state');
        const $tableContainer = $taskList.closest('.table-container');

        // Cantidad de filas
        const rowCount = $taskList.querySelectorAll('tr').length;

        if (rowCount === 0) {
            $emptyState.classList.remove('hidden');
            $tableContainer.classList.add('hidden');
        } else {
            $emptyState.classList.add('hidden');
            $tableContainer.classList.remove('hidden');
        }
    }


    //3.FUNCIONES DE PERSISTENCIA


    // localStorage.removeItem('tasks');
    // pruebaInicialCargaDeTareas();
    function pruebaInicialCargaDeTareas() {
        const pendingTasksList = [
            { done: false, text: 'Hacer tarea de Álgebra', priority: 'Alta', dueDate: '2024-12-19', dueTime: '16:00' },
            { done: false, text: 'Lavar la ropa', priority: 'Media', dueDate: '2024-12-20', dueTime: '18:00' }
        ];

        const doneTasksList = [
            { done: true, text: 'Estudiar programación', priority: 'Alta', dueDate: '2024-12-13', dueTime: '13:00' }
        ];

        const tasks = {
            pending: pendingTasksList,
            done: doneTasksList
        };

        const tasksJSON = JSON.stringify(tasks);

        localStorage.setItem('tasks', tasksJSON);
    }


    function loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');

        if (!tasksJSON) {
            taskList = { pending: [], done: [] };
            return;
        }

        $taskList.innerHTML = '';

        try {
            taskList = JSON.parse(tasksJSON);

            taskList.pending.forEach(task => {
                const $newRow = createRowElement(task);
                $taskList.appendChild($newRow);
            });

        } catch (e) {
            console.error("Error al parsear tareas de localStorage:", e);
            //localStorage.removeItem('tasks'); // Opcional
            console.log(localStorage.getItem('tasks'));
        }

        checkEmptyState();
    }


    function saveTasks() {
        // 1. Obtener la información de las filas
        const tasksPending = [];
        document.querySelectorAll('#task-list tr').forEach(row => {
            const taskDone = row.querySelector('td:nth-child(2) input').checked;
            const taskText = row.querySelector('td:nth-child(3)').textContent.trim();
            const taskPriority = row.querySelector('td:nth-child(6)').textContent.trim();
            const taskDueDate = row.querySelector('td:nth-child(4)').textContent.trim();
            const taskDueTime = row.querySelector('td:nth-child(5)').textContent.trim();

            tasksPending.push({
                done: taskDone,
                text: taskText,
                priority: taskPriority,
                dueDate: taskDueDate,
                dueTime: taskDueTime
            });
        });

        const tasksDone = taskList.done; // TODO: implementar tareas hechas



        const tasks = { pending: tasksPending, done: tasksDone };

        // 2. Convertir el array de objetos a una cadena JSON
        const tasksJSON = JSON.stringify(tasks);

        // 3. Guardar la cadena en localStorage
        localStorage.setItem('tasks', tasksJSON);
    }




    //4.INICIO/CARGA

    loadTasks();





    //5.EVENTOS


    $addTaskBtn.addEventListener('click', () => {
        // 1. Crear el HTML de la nueva fila vacía
        const newRowHTML = `
        <tr draggable="true">
            <td class="col-mover drag-handle">
                <i class="fa-solid fa-grip-vertical"></i>
            </td>
            <td><input type="checkbox"></td>
            <td>Nueva tarea...</td>
            <td>${new Date().toLocaleDateString('es-ES')}</td>
            <td>00:00</td>
            <td>Media</td>
            <td class="action-cell">
                <button class="edit-btn">
                    <i class="fa-solid fa-pencil"></i>
                </button>
            </td>
        </tr>
        `;

        // 2. Insertar al final de la tabla de pendientes
        $taskList.insertAdjacentHTML('beforeend', newRowHTML);

        // 3. Persistir en LocalStorage
        saveTasks();

        checkEmptyState();

        // Opcional: Podrías disparar automáticamente el editor en la nueva celda
        const $newRow = $taskList.lastElementChild;
        const $taskCell = $newRow.cells[2];
        showEditor($taskCell);
    });



    $taskList.addEventListener('dragstart', (e) => {
        const $row = e.target.closest('tr');
        if (!$row) return;


        // Verificar si el clic fue en el 'drag-handle'.
        const handleElement = $row.querySelector('.drag-handle');
        //posicion del handle
        const rect = handleElement.getBoundingClientRect();

        //posicion del mouse
        const y = e.clientY;
        const x = e.clientX;

        const isHandleClicked = (
            (rect.left <= x && x <= rect.right) &&
            (rect.top <= y && y <= rect.bottom)
        );

        if (!isHandleClicked) {
            e.preventDefault();
            return;
        }


        $draggedItem = $row; //fila arrastrada

        setTimeout(() => {
            $row.classList.add('dragging');
        }, 0);

        e.dataTransfer.setData('text/plain', 'reordering');
    });

    $taskList.addEventListener('dragover', (e) => {
        e.preventDefault(); // Permitir la caída (drop).

        //targetRow es la fila sobre la que se está arrastrando
        const $targetRow = e.target.closest('tr');

        if (!$targetRow || $targetRow === $draggedItem) return;

        // Limpiar el indicador de destino de todas las filas
        $taskList.querySelectorAll('tr').forEach($tr => $tr.classList.remove('drop-target-top', 'drop-target-bottom'));

        //Verificacion de adyacencia
        //targetRow esta justo despues de draggedItem
        const isNext = ($draggedItem === $targetRow.previousElementSibling);
        // targetRow esta justo antes de draggedItem
        const isPrevious = ($draggedItem === $targetRow.nextElementSibling);

        // Añadir el indicador de destino a la fila actual
        if ($draggedItem && $targetRow && $draggedItem !== $targetRow) {

            const rect = $targetRow.getBoundingClientRect(); //dimensiones y posición de la fila destino
            const y = e.clientY; // Posición Y del cursor

            // Determinar si soltamos arriba o abajo de la fila destino
            if (y < rect.top + rect.height / 2) {
                if (isNext) return; //si es adyacente, no mostrar borde
                $targetRow.classList.add('drop-target-top');
            } else {
                if (isPrevious) return; //si es adyacente, no mostrar borde
                $targetRow.classList.add('drop-target-bottom');
            }
        }
    });

    $taskList.addEventListener('drop', (e) => {
        e.preventDefault();

        const $targetRow = e.target.closest('tr');

        if ($draggedItem && $targetRow && $draggedItem !== $targetRow) {

            const rect = $targetRow.getBoundingClientRect(); //dimensiones y posición de la fila destino
            const y = e.clientY; // Posición Y del cursor

            // Determinar si soltamos arriba o abajo de la fila destino
            if (y < rect.top + rect.height / 2) {
                // Soltar arriba de la fila destino
                $taskList.insertBefore($draggedItem, $targetRow);
            } else {
                // Soltar abajo de la fila destino
                $taskList.insertBefore($draggedItem, $targetRow.nextSibling);
            }

            // Persistencia
            saveTasks();
        }
    });

    $taskList.addEventListener('dragend', (e) => {
        // Limpiar las clases y variables después de la operación
        $draggedItem.classList.remove('dragging');
        $taskList.querySelectorAll('tr').forEach($tr => $tr.classList.remove('drop-target-top', 'drop-target-bottom'));
        $draggedItem = null;
    });

    $taskList.addEventListener('dragleave', (e) => {
        // Esto previene que el borde se quede si sales de la fila destino
        const $targetRow = e.target.closest('tr');
        if ($targetRow) {
            $targetRow.classList.remove('drop-target-top', 'drop-target-bottom');
        }
    });






    // Modal editor
    const $backdrop = document.getElementById('modal-backdrop');
    const $input = document.getElementById('modal-editor-input');
    let $currentEditingCell = null; // Celda original que se está editando


    function showEditor($cell) {
        if ($currentEditingCell) return; // Ya estamos editando

        $currentEditingCell = $cell;
        const cellRect = $cell.getBoundingClientRect();

        //Aplicar Dimensiones y Posición al input
        // $input.style.width = cellRect.width +'px';
        $input.style.height = cellRect.height + 14 + 'px';
        $input.style.top = cellRect.top + 'px';
        $input.style.left = cellRect.left + 'px';
        $input.value = $cell.textContent.trim();

        //Mostrar
        $input.style.display = 'block';
        $backdrop.style.display = 'block';

        $input.focus();

        //Esto es para que al desenfocarse el input, se guarde o cancele la edición
        $input.addEventListener('blur', editorBlurHandler);
    }

    function editorBlurHandler() {
        // Si el 'blur' ocurre porque se presiona Enter, no hacemos nada 
        // porque el keypress ya guardó y llamó a hideEditor.
        hideEditor(false);
    }

    function hideEditor(save = false) {
        if (!$currentEditingCell) return;

        if (save) {
            const newText = $input.value.trim();
            if ($currentEditingCell.textContent !== newText) {
                $currentEditingCell.textContent = newText;
                saveTasks();
            }
        }

        // 3. Ocultar
        $input.style.display = 'none';
        $backdrop.style.display = 'none';

        // 4. Limpiar referencias
        $currentEditingCell = null;
        //esto es para que no se acumulen los listeners cada que haga clic en una celda
        $input.removeEventListener('blur', editorBlurHandler);
    }

    $backdrop.addEventListener('mousedown', () => {
        hideEditor(true);
    });

    $input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            hideEditor(true);
        }
    });

    $taskList.addEventListener('click', (e) => {
        const $clickedCell = e.target.closest('td');

        if (
            !$clickedCell ||
            $clickedCell.classList.contains('col-mover') ||
            $clickedCell.classList.contains('action-cell') ||
            $clickedCell.querySelector('input[type="checkbox"]')
        ) {
            return;
        }

        // Si la celda es editable, llamamos al modal
        showEditor($clickedCell);
    });

});