import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-[#141414] border-t border-white/5 text-gray-500 text-xs py-12 px-6 md:px-14">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4 text-gray-400">
                    <span>Questions? Call 000-800-919-1694</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">FAQ</a></li>
                        <li><a href="#" className="hover:underline">Investor Relations</a></li>
                        <li><a href="#" className="hover:underline">Privacy</a></li>
                        <li><a href="#" className="hover:underline">Speed Test</a></li>
                    </ul>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">Help Centre</a></li>
                        <li><a href="#" className="hover:underline">Jobs</a></li>
                        <li><a href="#" className="hover:underline">Cookie Preferences</a></li>
                        <li><a href="#" className="hover:underline">Legal Notices</a></li>
                    </ul>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">Account</a></li>
                        <li><a href="#" className="hover:underline">Ways to Watch</a></li>
                        <li><a href="#" className="hover:underline">Corporate Information</a></li>
                        <li><a href="#" className="hover:underline">Only on Netflix</a></li>
                    </ul>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:underline">Media Centre</a></li>
                        <li><a href="#" className="hover:underline">Terms of Use</a></li>
                        <li><a href="#" className="hover:underline">Contact Us</a></li>
                        <li><a href="#" className="hover:underline">Gemini AI Engine</a></li>
                    </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5 text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Netflix GPT &copy; {new Date().getFullYear()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> & Google Gemini AI
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="border border-white/10 px-2 py-1 rounded">Service Code: 839-204</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
