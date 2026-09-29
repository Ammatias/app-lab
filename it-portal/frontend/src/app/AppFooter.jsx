import { motion } from 'framer-motion'

export function AppFooter() {
  return (
    <motion.footer
      className="portal-footer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div className="portal-footer-content">
        <p className="portal-footer-line">Copyright © 2026</p>
        <p className="portal-footer-line">Отдел информационных технологий</p>
        <p className="portal-footer-line">Демонстрационный ИТ-портал</p>
        <p className="portal-footer-line portal-footer-rights">Все права защищены.</p>
      </div>
    </motion.footer>
  )
}
