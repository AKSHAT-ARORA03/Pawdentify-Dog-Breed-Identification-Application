import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Shield, FileText } from 'lucide-react'
import logoUrl from '../assets/logo.svg'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={logoUrl} alt="Pawdentify" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Dog Breed Identification</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered dog breed identification platform trusted by thousands of dog owners worldwide. 
              Discover your dog's breed with cutting-edge technology.
            </p>
            <div className="flex items-center space-x-2 text-primary-400">
              <Heart className="h-4 w-4" />
              <span className="text-sm">Made with love for dogs everywhere</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-primary-400 transition-colors">
                  Scan Dog
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Security</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Dog Breed Identification. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a 
              href="mailto:support@pawdentify.com" 
              className="flex items-center space-x-1 text-gray-400 hover:text-primary-400 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm">Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
