/**
 * Preload script for frontend tests
 * Registers happy-dom globals BEFORE any test code runs
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Register window, document, navigator, etc. globally
GlobalRegistrator.register()
