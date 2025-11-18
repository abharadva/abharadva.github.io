
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";

export const siteContent = {
    header: {
        navLinks: [
            { href: "/", label: "Home" },
            { href: "/showcase", label: "Showcase" },
            { href: "/projects", label: "Projects" },
            { href: "/blog", label: "Blog" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
        ],
    },
    hero: {
        name: "Akshay Bharadva",
        title: "Full-Stack Developer.",
        description: "I build robust, scalable, and user-centric web applications. With a passion for clean code and open-source, I turn complex problems into elegant digital solutions.",
        statusPanel: {
            title: "Status Panel",
            availability: "Available for new opportunities",
            currentlyExploring: {
                title: "Currently Exploring",
                items: ["Advanced TypeScript", "Web Assembly (WASM)"],
            },
            latestProject: {
                title: "Latest Project",
                name: "Portfolio Redesign",
                linkText: "See all projects",
                href: "/projects",
            },
        },
        socials: [
            { label: "GitHub Profile", href: "https://github.com/akshay-bharadva", icon: Github },
            { label: "LinkedIn Profile", href: "https://www.linkedin.com/in/akshay-bharadva/", icon: Linkedin },
            { label: "Email Akshay", href: "mailto:akshaybharadva19@gmail.com", icon: Mail },
        ],
    },
    experience: {
        mainTitle: "Experience",
        mainSubtitle: "CAREER",
    },
    projects: {
        mainTitle: "My Projects",
        description: "A selection of my open-source work from GitHub.",
        viewMore: "More on GitHub",
    },
    newsletter: {
        title: "Join The List",
        description: "Get project updates, tech articles, and insights delivered straight to your inbox. No spam, ever.",
    },
    footer: {
        copyrightText: `Built with Next.js, Tailwind, and a lot of coffee.`,
        socials: [
            { href: "https://github.com/akshay-bharadva", label: "GitHub Profile", icon: Github },
            { href: "https://www.linkedin.com/in/akshay-bharadva/", label: "LinkedIn Profile", icon: Linkedin },
            { href: "mailto:akshaybharadva19@gmail.com", label: "Email Akshay", icon: Mail },
        ],
    },
    pages: {
        about: {
            title: "About Me",
            description: "Learn more about Akshay Bharadva, the developer behind the code.",
            heading: "[ ABOUT_ME ]",
            bio: [
                "I'm a full-stack developer specializing in building robust and scalable web applications. My passion lies at the intersection of clean architecture, efficient code, and intuitive user experiences.",
                "I thrive on solving complex problems and am constantly exploring new technologies to enhance my toolkit. I am a strong advocate for open-source and contribute to projects whenever I can."
            ]
        },
        contact: {
            title: "Contact Me",
            description: "Let's build something great together. Get in touch with Akshay Bharadva.",
            heading: "Get In Touch",
            subheading: "Have a project in mind or just want to say hello? I'd love to hear from you.",
            servicesTitle: "What I Can Do For You"
        },
        projects: {
            title: "My Projects",
            description: "A collection of projects developed by Akshay Bharadva, showcasing skills in various technologies.",
            heading: "Projects"
        },
        showcase: {
            title: "Showcase",
            description: "A curated collection of my work, skills, and professional journey.",
            heading: "Showcase.",
            subheading: "A deep dive into my professional journey, featured projects, and technical expertise."
        },
        blog: {
            title: "The Blog",
            description: "A collection of articles on web development, design, and technology."
        }
    },
};
