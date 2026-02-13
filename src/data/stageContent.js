
// Mock Data for Stages and Lessons
// Structure: Stage -> Levels (Lessons) -> { title, vocabulary: [], topic }

export const STAGE_CONTENT = {
    1: {
        title: "Sơ Nhập Giang Hồ (Stage 1)",
        minLevel: 1,
        maxLevel: 30,
        maps: [0, 1], // Map IDs allowed
        lessons: [
            // --- SECTION 1: GREETINGS & BASICS (1-5) ---
            { id: '1-1', title: 'Level 1: Hello & Goodbye', topic: 'Greetings', vocab: ['Hello', 'Hi', 'Good morning', 'Good night', 'Goodbye', 'See you'] },
            { id: '1-2', title: 'Level 2: What is your name?', topic: 'Introduction', vocab: ['Name', 'Call', 'My', 'Your', 'His', 'Her'] },
            { id: '1-3', title: 'Level 3: How are you?', topic: 'Feelings', vocab: ['Fine', 'Good', 'Sad', 'Happy', 'Tired', 'Okay'] },
            { id: '1-4', title: 'Level 4: Countries & Origins', topic: 'Origin', vocab: ['Where', 'From', 'Country', 'City', 'Live', 'Born'] },
            { id: '1-5', title: 'Level 5: Numbers 1-20', topic: 'Numbers', vocab: ['One', 'Two', 'Ten', 'Twenty', 'Count', 'Number'] },

            // --- SECTION 2: FAMILY & FRIENDS (6-10) ---
            { id: '1-6', title: 'Level 6: Family Members', topic: 'Family', vocab: ['Mother', 'Father', 'Brother', 'Sister', 'Grandma', 'Grandpa'] },
            { id: '1-7', title: 'Level 7: Describing People', topic: 'Description', vocab: ['Tall', 'Short', 'Young', 'Old', 'Beautiful', 'Handsome'] },
            { id: '1-8', title: 'Level 8: Friends & Relationships', topic: 'Relationships', vocab: ['Friend', 'Best friend', 'Colleague', 'Neighbor', 'Know', 'Meet'] },
            { id: '1-9', title: 'Level 9: Ages & Birthdays', topic: 'Time', vocab: ['Year', 'Old', 'Birthday', 'Date', 'Month', 'Born'] },
            { id: '1-10', title: 'Level 10: Pets & Animals', topic: 'Animals', vocab: ['Dog', 'Cat', 'Bird', 'Fish', 'Like', 'Have'] },

            // --- SECTION 3: HOBBIES (11-15) ---
            { id: '1-11', title: 'Level 11: What do you like?', topic: 'Hobbies', vocab: ['Like', 'Love', 'Hate', 'Enjoy', 'Prefer', 'Interest'] },
            { id: '1-12', title: 'Level 12: Sports', topic: 'Sports', vocab: ['Soccer', 'Tennis', 'Play', 'Game', 'Win', 'Lose'] },
            { id: '1-13', title: 'Level 13: Music & Movies', topic: 'Entertainment', vocab: ['Listen', 'Watch', 'Song', 'Movie', 'Singer', 'Actor'] },
            { id: '1-14', title: 'Level 14: Reading & Books', topic: 'Books', vocab: ['Read', 'Book', 'Story', 'Page', 'Library', 'Author'] },
            { id: '1-15', title: 'Level 15: Weekend Activities', topic: 'Activities', vocab: ['Weekend', 'Free time', 'Relax', 'Sleep', 'Go out', 'Park'] },

            // --- SECTION 4: ROUTINES (16-20) ---
            { id: '1-16', title: 'Level 16: Daily Routine', topic: 'Routine', vocab: ['Morning', 'Wake up', 'Breakfast', 'Shower', 'Work', 'School'] },
            { id: '1-17', title: 'Level 17: Telling Time', topic: 'Time', vocab: ['Clock', 'Hour', 'Minute', 'O\'clock', 'Half past', 'Quarter'] },
            { id: '1-18', title: 'Level 18: Days of the Week', topic: 'Calendar', vocab: ['Monday', 'Sunday', 'Today', 'Tomorrow', 'Yesterday', 'Week'] },
            { id: '1-19', title: 'Level 19: House & Home', topic: 'Home', vocab: ['House', 'Room', 'Kitchen', 'Bedroom', 'Table', 'Chair'] },
            { id: '1-20', title: 'Level 20: Chores', topic: 'Work', vocab: ['Clean', 'Wash', 'Cook', 'Sweep', 'Help', 'Busy'] },

            // --- SECTION 5: FOOD (21-25) ---
            { id: '1-21', title: 'Level 21: Food & Drinks', topic: 'Food', vocab: ['Eat', 'Drink', 'Rice', 'Water', 'Bread', 'Meat'] },
            { id: '1-22', title: 'Level 22: Fruits & Vegetables', topic: 'Nature', vocab: ['Apple', 'Banana', 'Carrot', 'Tomato', 'Green', 'Fresh'] },
            { id: '1-23', title: 'Level 23: At the Restaurant', topic: 'Dining', vocab: ['Menu', 'Order', 'Waiter', 'Bill', 'Table', 'Delicious'] },
            { id: '1-24', title: 'Level 24: Cooking', topic: 'Cooking', vocab: ['Cook', 'Boil', 'Fry', 'Cut', 'Mix', 'Recipe'] },
            { id: '1-25', title: 'Level 25: Tastes', topic: 'Senses', vocab: ['Sweet', 'Sour', 'Spicy', 'Salty', 'Hot', 'Cold'] },

            // --- SECTION 6: TRAVEL (26-30) ---
            { id: '1-26', title: 'Level 26: Weather', topic: 'Nature', vocab: ['Sun', 'Rain', 'Cloud', 'Hot', 'Cold', 'Wind'] },
            { id: '1-27', title: 'Level 27: Seasons', topic: 'Nature', vocab: ['Spring', 'Summer', 'Autumn', 'Winter', 'Season', 'Weather'] },
            { id: '1-28', title: 'Level 28: Transport', topic: 'Travel', vocab: ['Car', 'Bus', 'Bike', 'Train', 'Plane', 'Drive'] },
            { id: '1-29', title: 'Level 29: Asking Directions', topic: 'Travel', vocab: ['Where', 'Left', 'Right', 'Straight', 'Map', 'Far'] },
            { id: '1-30', title: 'Level 30: My City', topic: 'Places', vocab: ['City', 'Town', 'Beautiful', 'Crowded', 'Quiet', 'Visit'] }
        ]
    },
    2: {
        title: "Cao Thủ Võ Lâm (Stage 2)",
        minLevel: 31,
        maxLevel: 60,
        maps: [2, 3],
        lessons: [
            { id: '2-1', title: 'Level 31: Opinions', topic: 'Debate', vocab: ['I think', 'In my opinion', 'However', 'Therefore', 'Agree', 'Disagree'] },
            { id: '2-2', title: 'Level 32: Technology', topic: 'Tech', vocab: ['Computer', 'Internet', 'AI', 'Software', 'Hardware', 'Network'] },
            // ...
        ]
    },
    3: {
        title: "Đại Sư Tông Sư (Stage 3)",
        minLevel: 61,
        maxLevel: 999,
        maps: [4, 5],
        lessons: [
            { id: '3-1', title: 'Level 61: Philosophy', topic: 'Academic', vocab: ['Existentialism', 'Ethics', 'Morality', 'Consciousness', 'Reality', 'Truth'] },
            { id: '3-2', title: 'Level 62: Business Strategy', topic: 'Business', vocab: ['Revenue', 'Profit', 'Stakeholder', 'Market Share', 'Strategy', 'Innovation'] },
            // ...
        ]
    }
};

export const canAccessStage = (userLevel, stageId) => {
    const stage = STAGE_CONTENT[stageId];
    return userLevel >= stage.minLevel;
};
