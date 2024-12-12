export const load = async () => { 
    
    const placeholders = [
        "Ponder",
        "I'm feeling lucky",
        "Search",
        "Gaze",
        "Query",
        "Type here, if you wish",
        "Shout into abyss"
    ]
    return {
        placeholder: placeholders[Math.floor(Math.random() * placeholders.length)],
    }
}