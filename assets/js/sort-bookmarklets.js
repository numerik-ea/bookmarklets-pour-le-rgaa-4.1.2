document.addEventListener('DOMContentLoaded', function() {
    // Find all sort dropdowns on the page
    const sortDropdowns = document.querySelectorAll('[id^="sort-dropdown-"]');
    
    sortDropdowns.forEach(function(sortDropdown) {
        const bookmarkletsList = sortDropdown.closest('section').querySelector('.bookmarklets-list');
        const sortButton = sortDropdown.closest('.sort-dropdown-container').querySelector('.sort-button');
        
        if (!bookmarkletsList || !sortButton) return;
        
        // Get all bookmarklet items for this section
        const bookmarkletItems = Array.from(bookmarkletsList.querySelectorAll('li[id]'));
        
        if (bookmarkletItems.length === 0) return;
        
        // Function to sort bookmarklets
        function sortBookmarklets(sortType = 'name') {
            const sortedItems = [...bookmarkletItems];
            
            if (sortType === 'date') {
                // Sort by date (newest first)
                sortedItems.sort((a, b) => {
                    try {
                        // Get the original ISO date from the data attribute
                        const dateA = a.getAttribute('data-date');
                        const dateB = b.getAttribute('data-date');
                        
                        if (!dateA || !dateB) {
                            return 0; // Keep original order if date is missing
                        }
                        
                        // Parse ISO dates (YYYY-MM-DD)
                        const parsedDateA = new Date(dateA);
                        const parsedDateB = new Date(dateB);
                        
                        if (isNaN(parsedDateA.getTime()) || isNaN(parsedDateB.getTime())) {
                            return 0; // Keep original order if date is invalid
                        }
                        
                        return parsedDateB - parsedDateA; // Newest first
                    } catch (error) {
                        console.warn('Error sorting by date:', error);
                        return 0; // Keep original order if there's an error
                    }
                });
            } else {
                // Sort by name (alphabetical)
                sortedItems.sort((a, b) => {
                    try {
                        const nameA = a.querySelector('.bookmarklet-link').textContent.trim();
                        const nameB = b.querySelector('.bookmarklet-link').textContent.trim();
                        return nameA.localeCompare(nameB, 'fr');
                    } catch (error) {
                        console.warn('Error sorting by name:', error);
                        return 0; // Keep original order if there's an error
                    }
                });
            }
            
            // Reorder items in the DOM
            sortedItems.forEach(item => {
                bookmarkletsList.appendChild(item);
            });
        }
        
        // Event listener for sort button click
        sortButton.addEventListener('click', function() {
            const selectedSortType = sortDropdown.value;
            sortBookmarklets(selectedSortType);
            
            // Save preference to localStorage
            localStorage.setItem('bookmarkletSortPreference', selectedSortType);
        });
        
        // Load saved preference and set dropdown value (but don't auto-sort)
        const savedPreference = localStorage.getItem('bookmarkletSortPreference');
        if (savedPreference && (savedPreference === 'name' || savedPreference === 'date')) {
            sortDropdown.value = savedPreference;
        }
    });
});
