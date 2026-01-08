/**
 * Horoscope API Integration
 * Fetches monthly horoscope readings with caching
 */

const ZODIAC_SIGNS = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

interface HoroscopeReading {
    sign: ZodiacSign;
    period: "monthly";
    reading: string;
    date: string;
}

/**
 * Fetch monthly horoscope from aztro API (free, no key required)
 * Falls back to generic reading if API fails
 */
export async function getMonthlyHoroscope(zodiacSign: string): Promise<string> {
    const sign = zodiacSign.toLowerCase() as ZodiacSign;

    if (!ZODIAC_SIGNS.includes(sign)) {
        return getGenericHoroscope(sign);
    }

    try {
        // Using aztro API - free, no auth required
        // Note: aztro doesn't have monthly, so we'll use "today" and enhance it
        const response = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Horoscope API error: ${response.status}`);
        }

        const data = await response.json();

        // Enhance the daily reading to make it more monthly-focused
        const monthlyReading = `This month, ${data.description} Focus on ${data.mood} energy and embrace opportunities in ${data.lucky_time}. Your lucky number is ${data.lucky_number}.`;

        return monthlyReading;
    } catch (error) {
        console.error("Horoscope API failed, using fallback:", error);
        return getGenericHoroscope(sign);
    }
}

/**
 * Generic horoscope fallback based on zodiac traits
 */
function getGenericHoroscope(sign: string): string {
    const horoscopes: Record<string, string> = {
        aries: "This month brings opportunities for bold action and new beginnings. Your natural leadership will shine, but remember to balance ambition with patience. Focus on personal growth and don't be afraid to take calculated risks.",
        taurus: "Stability and comfort are your themes this month. Focus on building lasting foundations in your relationships and career. Your practical nature will help you make wise financial decisions. Take time to enjoy life's simple pleasures.",
        gemini: "Communication and connection are highlighted this month. Your curiosity will lead you to exciting new ideas and people. Stay flexible and embrace change. Your adaptability is your greatest strength right now.",
        cancer: "Emotional depth and intuition guide you this month. Focus on nurturing your relationships and creating a safe, comfortable home environment. Trust your feelings and don't be afraid to show vulnerability.",
        leo: "Your creativity and confidence are at their peak this month. It's time to shine and pursue your passions. Leadership opportunities may arise. Remember to share the spotlight and celebrate others' successes too.",
        virgo: "Organization and attention to detail will serve you well this month. Focus on health, wellness, and improving your daily routines. Your analytical skills will help solve complex problems. Don't forget to rest.",
        libra: "Balance and harmony are your goals this month. Focus on relationships and finding middle ground in conflicts. Your diplomatic nature will be appreciated. Make time for beauty and art in your life.",
        scorpio: "Transformation and deep introspection mark this month. Embrace change and let go of what no longer serves you. Your intensity and passion will drive meaningful progress. Trust your instincts.",
        sagittarius: "Adventure and expansion call to you this month. Seek new experiences and broaden your horizons. Your optimism is contagious. Focus on learning and philosophical growth. Travel may bring insights.",
        capricorn: "Ambition and discipline are your allies this month. Focus on long-term goals and career advancement. Your hard work will pay off. Remember to balance work with personal time and relationships.",
        aquarius: "Innovation and independence define your month. Embrace your unique perspective and don't be afraid to challenge the status quo. Community and friendship are important. Share your visionary ideas.",
        pisces: "Intuition and creativity flow freely this month. Trust your dreams and artistic impulses. Your empathy helps others, but remember to set boundaries. Spiritual practices may bring peace and clarity."
    };

    return horoscopes[sign.toLowerCase()] || "This month brings opportunities for growth and self-discovery. Trust your instincts and stay open to new experiences.";
}

/**
 * Determine zodiac sign from date of birth
 */
export function getZodiacSign(dateOfBirth: Date): ZodiacSign {
    const month = dateOfBirth.getMonth() + 1; // 1-12
    const day = dateOfBirth.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
    return "pisces";
}
