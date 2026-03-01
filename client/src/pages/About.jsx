// src/pages/About.jsx
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  MinusSmallIcon,
  PlusSmallIcon,
  CheckCircleIcon,
} from "@heroicons/react/20/solid";
import HelloHilaryLogo512 from "../assets/HelloHilaryLogo512.png";
import HilSmileInHall from "../assets/HilSmileInHall.jpg";

const mainpic = HilSmileInHall;

const benefits = [
  "Sign in with a magic link to upload a short video saying hello to Hilary.",
  "Hilary can watch your videos on her iPad with help — anytime, as many times as she likes.",
  "Over time, she'll have a growing collection of loving messages, songs, and stories.",
  "We also help Hilary upload her own videos so everyone can stay connected.",
  "Ideas: sing a song, say hello, share your day, show your pets — anything short and sweet!",
  "This is a private app made just for Hilary — please keep it within her circle of family and friends.",
];

const faqs = [
  {
    question: "Who will see my videos?",
    answer:
      "Primarily Hilary, of course! Videos are stored securely and only accessible within the app to registered users who care about her. It's a loving community brought together through our connection to Hilary.",
  },
  {
    question: "Can I delete my videos?",
    answer:
      "Yes — only the person who uploaded a video can delete it. Admins (family) can also manage content if needed.",
  },
  {
    question: "Can videos be downloaded?",
    answer:
      "Not in the current version — downloads are disabled to keep everything private and simple. Focus is on watching within the app.",
  },
  {
    question: "How can I suggest improvements or new features?",
    answer:
      "We'd love to hear from you! Email sheila at smcgov@11.11@gmail.com with ideas, feedback, or any technical notes (browser, device, etc.). Your input helps make the app even better for Hilary.",
  },
  {
    question: "Can I create a profile for someone not comfortable with tech?",
    answer:
      "Absolutely — with their permission! You can sign in/out as different users. Guest videos shared on your profile work too. Some of the sweetest contributions come from less tech-savvy folks.",
  },
  {
    question: "What is my email used for?",
    answer:
      "Only for magic-link sign-in (no passwords stored). No marketing emails or spam — ever. We may add gentle notifications for new videos in the future, but you control that.",
  },
  {
    question: "Can I add this to my phone home screen?",
    answer:
      "Yes! Open the app in your phone/tablet browser, tap the share button, then choose 'Add to Home Screen'. It will look and feel like a real app.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero section with photo + intro */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16">
          <img
            src={mainpic}
            alt="Hilary smiling in the hallway"
            className="w-full max-w-sm lg:max-w-md rounded-3xl shadow-2xl object-cover border-8 border-pink-200"
          />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-6">
              About Hello Hilary 💕
            </h1>
            <p className="text-xl md:text-xl text-gray-700 leading-relaxed">
              If you've been invited to the Hello Hilary app, it's because you
              are someone special in Hilary's life. Even if you haven't seen her
              in a while, she still has fond memories of you! Please help us
              shine some light into her world and drop in once in a while and
              say Hello!
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-700 mb-8 text-center">
            How to Make Hilary Smile!
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg text-gray-800">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-4">
                <CheckCircleIcon className="h-7 w-7 text-pink-500 flex-shrink-0 mt-1" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex justify-center mb-10">
            <img
              src={HelloHilaryLogo512}
              alt="Hello Hilary Logo"
              className="h-48 w-auto rounded-xl shadow-md"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-pink-700 mb-10 text-center">
            Frequently Asked Questions
          </h2>

          <dl className="space-y-6 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="pt-6">
                <dt>
                  <DisclosureButton className="group flex w-full items-center justify-between text-left text-lg font-semibold text-gray-900 hover:text-pink-700 focus:outline-none">
                    <span>{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusSmallIcon
                        aria-hidden="true"
                        className="h-6 w-6 group-data-[open]:hidden text-gray-500"
                      />
                      <MinusSmallIcon
                        aria-hidden="true"
                        className="h-6 w-6 hidden group-data-[open]:block text-pink-600"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-3 pr-12">
                  <p className="text-base leading-7 text-gray-700">
                    {faq.answer}
                  </p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>

        {/* Footer call-to-action */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-6">
            Thank you for being part of Hilary's circle of love.
          </p>
        </div>
      </div>
    </div>
  );
}
