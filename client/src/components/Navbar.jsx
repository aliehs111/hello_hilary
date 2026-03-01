// src/components/Navbar.jsx
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/20/solid"; // Add useLocation for active state
import logo from "../assets/HelloHilaryLogo192.png"; // your logo

const navigation = [
  { name: "Sign In", href: "/signin" },
  { name: "Gallery", href: "/gallery" },
  { name: "Hilary", href: "/hilary" },
  { name: "About", href: "/about" },
  { name: "Upload", href: "/upload" },
];

export default function Navbar() {
  const location = useLocation(); // To highlight active link

  return (
    <Disclosure
      as="nav"
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Mobile hamburger */}
            <div className="mr-2 -ml-2 flex items-center md:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon
                  aria-hidden="true"
                  className="block h-6 w-6 group-data-[open]:hidden"
                />
                <XMarkIcon
                  aria-hidden="true"
                  className="hidden h-6 w-6 group-data-[open]:block"
                />
              </DisclosureButton>
            </div>

            {/* Logo home link */}
            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
              >
                <img
                  alt="Hello Hilary – back to home"
                  src={logo}
                  className="h-8 w-auto md:h-10"
                />
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    location.pathname === item.href
                      ? "border-pink-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Add Hello button */}
          <div className="flex items-center">
            <Link
              to="/upload" // or /signin if you want auth gate there
              className="inline-flex items-center gap-x-1.5 rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />{" "}
              {/* Heroicon */}
              Add Hello
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      <DisclosurePanel className="md:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === item.href
                  ? "bg-pink-50 text-pink-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 pb-3">
          <div className="px-4">
            <Link
              to="/upload"
              className="block rounded-md px-3 py-2 text-base font-medium text-white bg-pink-500 hover:bg-pink-600"
            >
              Add Hello
            </Link>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
