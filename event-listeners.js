// event-listeners.js

// =========================
// Event Listeners and Initialization
// =========================

document.getElementById('omit-raw-signals').addEventListener('change', function(e) {
    toggleRawSignalOmission(e.target.checked);
});

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        elements.body.classList.remove('light-mode', 'dark-mode');
        elements.body.classList.add(savedTheme);
        updateButtonText(savedTheme);
    }

    elements.themeToggleButton.addEventListener('click', () => {
        const currentTheme = elements.body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
        const newTheme = currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
        elements.body.classList.remove(currentTheme);
        elements.body.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        updateButtonText(newTheme);
    });

    // Check for 'webkitdirectory' support
    const supportsWebkitDirectory = 'webkitdirectory' in document.createElement('input');
    if (!supportsWebkitDirectory) {
        elements.browserWarningElem.style.display = 'block';
    }

    // Update file input label and display file count
    elements.fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        const irFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        const fileCount = irFiles.length;
        elements.fileCountElem.textContent = `${fileCount} .ir file${fileCount !== 1 ? 's' : ''} selected`;
        elements.totalFilesElem.textContent = fileCount;
        resetSummary();
    });

    // Process files
    elements.processButton.addEventListener('click', () => {
        const files = Array.from(elements.fileInput.files).filter(file => file.name.toLowerCase().endsWith('.ir'));
        processFiles(files);
    });

    // Update device types when repository changes
    elements.repoSelect.addEventListener('change', async () => {
        await updateDeviceTypeOptions();
    });

    // Export summary
    elements.exportSummaryBtn.addEventListener('click', exportSummary);

    // Copy summary
    elements.copySummaryBtn.addEventListener('click', copySummaryToClipboard);

    // Populate repository select
    populateRepoSelect();

    // Add event listeners for universal file option radio buttons
    elements.universalFileOption.forEach(radio => {
        radio.addEventListener('change', toggleUniversalFileOption);
    });

    // Add event listener for manual file upload
    elements.manualUniversalFile.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            elements.manualFileName.textContent = `Selected file: ${event.target.files[0].name}`;
        } else {
            elements.manualFileName.textContent = '';
        }
    });
    // Initial population of device type options
    updateDeviceTypeOptions();

    // Initial toggle of universal file option
    toggleUniversalFileOption();
});

// Populate repository select options
function populateRepoSelect() {
    elements.repoSelect.innerHTML = '';
    Object.keys(REPOSITORIES).forEach(repoName => {
        const option = document.createElement('option');
        option.value = repoName;
        option.textContent = repoName;
        elements.repoSelect.appendChild(option);
    });
}
