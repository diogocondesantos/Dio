// ===================================================
// DIO PORTFOLIO – Data Layer (Projects)
// ===================================================

let cachedProjects = [];

export async function loadProjectsData() {
    try {
        const response = await fetch('data/projects.json');
        cachedProjects = await response.json();
        
        const categoryPriority = {
            '3D VIZ': 1,
            'MOTION': 2,
            'INTERACTIVE': 3,
            'DIGITAL UI/UX': 4,
            'DESIGN': 5
        };
        
        cachedProjects.sort((a, b) => {
            const catA = a.categories && a.categories.length > 0 ? a.categories[0] : '';
            const catB = b.categories && b.categories.length > 0 ? b.categories[0] : '';
            const priorityA = categoryPriority[catA] || 99;
            const priorityB = categoryPriority[catB] || 99;
            return priorityA - priorityB;
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

export function getProjects() {
    return cachedProjects;
}

export function getProjectById(id) {
    return cachedProjects.find(p => p.id === id);
}

export function getProjectsByCategory(category) {
    if (!category || category === 'ALL') return cachedProjects;
    return cachedProjects.filter(p =>
        p.categories && p.categories.includes(category)
    );
}

export function getPreviousProject(id) {
    const currentIndex = cachedProjects.findIndex(p => p.id === id);
    if (currentIndex === -1) return null;
    const prevIndex = currentIndex === 0 ? cachedProjects.length - 1 : currentIndex - 1;
    return cachedProjects[prevIndex];
}

export function getNextProject(id) {
    const currentIndex = cachedProjects.findIndex(p => p.id === id);
    if (currentIndex === -1) return null;
    const nextIndex = currentIndex === cachedProjects.length - 1 ? 0 : currentIndex + 1;
    return cachedProjects[nextIndex];
}
