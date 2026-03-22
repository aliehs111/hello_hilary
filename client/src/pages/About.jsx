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
  "Email sheila@hello-hilary.com with a quick note asking for a sign-in password and we'll get you set up as a user and email you back your sign-in credentials.",
  "Hilary can watch your videos on her iPad with help — anytime, as many times as she likes.",
  "Over time, she'll have a growing collection of loving messages, songs, and stories.",
  "We also help Hilary upload her own videos to the Hilary's page so everyone can see what she's up to!",
  "Ideas: Just say hello! Sing a song, share your day, show your pets — the point is to remind Hilary that you're thinking of her and to entertain her.",
  "This is a private app made just for Hilary — please keep it within her circle of family and friends.",
];

const faqs = [
  {
    question: "Who will see my videos?",
    answer:
      "Primarily Hilary, of course! Videos are stored securely and only accessible within the app to registered users who care about her. All the uploaders are people who are connected to Hilary in some way — family, friends, caregivers. The idea is to create a safe and loving space for Hilary to enjoy videos from people who care about her.",
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
      "Please do! Email sheila@hello-hilary.com with ideas, feedback, or any technical notes (browser, device, etc.). Your input helps make the app even better for Hilary.",
  },

  {
    question: "What is my email used for?",
    answer:
      "No marketing emails or spam, of course. I might send out little reminders or announcements for new videos, but we're such a small group of users that I'm not going to automate any emails or anything crazy.  If you do not want to receive any emails, just let me know!",
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
          <div className="space-y-6 font-[Nunito]">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-800">
              About Hello Hilary 💕
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              <span className="text-pink-600 font-semibold">
                Thank you for being someone special for Hilary! 💕
              </span>{" "}
              If you've been invited to Hello Hilary, it's because you can make
              a difference in Hilary's life by adding thoughtful and
              entertaining videos for her to watch. Even if you haven't seen her
              in a while, she still has fond memories of you! And with just a
              simple “hello” you can brighten her day. Please drop in whenever
              you can — your messages will truly make a difference! 💕
            </p>

            <p className="text-xl text-gray-700 leading-relaxed">
              <span className="text-pink-600 font-semibold">
                To the amazing people who care for Hilary each day, Thank you!
              </span>{" "}
              We are so grateful for the kindness, patience, and support you
              give her every day. As her family, we can’t always be there in
              person, so it means so much to see her smiling and enjoying
              moments throughout her day. We would love it if you could share
              photos or short videos by selecting “Post to Hilary’s Page” when
              uploading. Plus if you have any personal videos of music, nature,
              your pets or your kids that you think would entertain Hilary
              please add those too! 💕
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-700 mb-8 text-center">
            How to Make Hilary Smile!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-lg text-gray-800">
            <ul className="space-y-6">
              {benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <CheckCircleIcon className="mt-1 h-7 w-7 flex-shrink-0 text-pink-500" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>

            <ul className="space-y-6">
              {benefits.slice(3, 6).map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <CheckCircleIcon className="mt-1 h-7 w-7 flex-shrink-0 text-pink-500" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
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
            Thank you for being part of the Hello Hilary Project!
          </p>
        </div>
      </div>
    </div>
  );
}
