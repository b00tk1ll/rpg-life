/**
 * Game configuration constants
 * Centralizes magic numbers used throughout the application
 */

// Mission rewards by category
export const MISSION_REWARDS = {
    MAIN: 25,
    SECONDARY: 15,
    BONUS: 10
}

// Habit configuration
export const HABIT_CONFIG = {
    PENALTY_MULTIPLIER: 2  // Negative habits penalty = value * multiplier
}

// Level progression configuration
export const LEVEL_CONFIG = {
    BASE_XP: 100,
    EXPONENT: 1.5  // XP threshold = BASE_XP * (level ^ EXPONENT)
}

// Long press configuration (in milliseconds)
export const INTERACTION = {
    LONG_PRESS_DELAY: 600,
    TOUCH_MOVE_THRESHOLD: 10  // pixels to cancel long press
}

// UI configuration
export const UI = {
    TUTORIAL_DELAY: 300,  // ms before showing tutorials
    TOAST_DURATION: 3000, // ms
    SUCCESS_MESSAGE_DELAY: 1000 // ms before closing after success
}
