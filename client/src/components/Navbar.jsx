// src/components/Navbar.jsx
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/20/solid";
import logo from "../assets/HelloHilaryLogo192.png";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Gallery", href: "/gallery" },
  { name: "Hilary", href: "/hilary" },
  { name: "About", href: "/about" },
  { name: "Upload", href: "/upload" },
  { name: "Home", href: "/" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  const navigation = currentUser
    ? navLinks
    : [{ name: "Sign In", href: "/signin" }, ...navLinks];

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
                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
              </DisclosureButton>
            </div>

            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-pink-300 rounded">
                <img alt="Hello Hilary – back to home" src={logo} className="h-8 w-auto md:h-10" />
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <>
                <span className="hidden md:block text-sm text-gray-600 font-medium">
                  {currentUser.display_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                >
                  Sign Out
                </button>
              </>
            )}
            <Link
              to="/upload"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
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
        <div className="border-t border-gray-200 pt-4 pb-3 px-4 space-y-2">
          {currentUser && (
            <>
              <p className="text-sm font-medium text-gray-700 px-3">{currentUser.display_name}</p>
              <button
                onClick={handleLogout}
                className="block w-full rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 text-left"
              >
                Sign Out
              </button>
            </>
          )}
          <Link
            to="/upload"
            className="block rounded-md px-3 py-2 text-base font-medium text-white bg-pink-500 hover:bg-pink-600"
          >
            Add Hello
          </Link>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
