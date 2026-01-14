document.addEventListener('DOMContentLoaded', function () {
    // Find all sort dropdowns on the page
    const sortDropdown = document.querySelector('[id^="sort-dropdown-"]');

    const bookmarkletsList = sortDropdown.closest('section').querySelector('.bookmarklets-list');
    const sortButton = sortDropdown.closest('.sort-dropdown-container').querySelector('.sort-button');

    if (!bookmarkletsList || !sortButton) return;

    // Get all bookmarklet items for this section
    const bookmarkletItems = Array.from(bookmarkletsList.querySelectorAll('li[id]'));

    if (bookmarkletItems.length === 0) return;

    // Function to sort bookmarklets
    function sortBookmarklets(sortType = 'name', callback = null) {
        const sortedItems = [...bookmarkletItems];

        if (sortType === 'date') {
            // Sort by date (newest first)
            sortedItems.sort((a, b) => {
                try {
                    // Get the original ISO date from the data attribute
                    const dateA = a.dataset.lastUpdated;
                    const dateB = b.dataset.lastUpdated;

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
            // Sort by name (with criteria number handling)
            sortedItems.sort((a, b) => {
                try {
                    const nameA = a.querySelector('.bookmarklet-link').textContent.trim();
                    const nameB = b.querySelector('.bookmarklet-link').textContent.trim();

                    // Function to parse criteria numbers for proper sorting
                    function parseCriteriaNumber(text) {
                        // Extract criteria number pattern like "10.1", "1.X", "9.4", etc.
                        const criteriaNumberMatch = text.match(/^(\d+)\.(\d+|[Xx])/i);
                        if (criteriaNumberMatch) {
                            const major = parseInt(criteriaNumberMatch[1], 10);
                            const minor = criteriaNumberMatch[2].toLowerCase() === 'x' ? 999 : parseInt(criteriaNumberMatch[2], 10);
                            return { major, minor, original: text };
                        }
                        // If no criteria number pattern, return null for alphabetical sorting
                        return null;
                    }

                    const criteriaA = parseCriteriaNumber(nameA);
                    const criteriaB = parseCriteriaNumber(nameB);

                    // If both have criteria numbers, sort numerically
                    if (criteriaA && criteriaB) {
                        if (criteriaA.major !== criteriaB.major) {
                            return criteriaA.major - criteriaB.major;
                        }
                        return criteriaA.minor - criteriaB.minor;
                    }

                    // If only one has criteria number, put criteria numbered items first
                    if (criteriaA && !criteriaB) return -1;
                    if (!criteriaA && criteriaB) return 1;

                    // If neither has criteria number, sort alphabetically
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

        // Execute callback immediately after sorting
        if (callback && typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    }

    // Event listener for sort button click
    sortButton.addEventListener('click', function () {
        const selectedSortType = sortDropdown.value;
        sortBookmarklets(selectedSortType);
    });
});
