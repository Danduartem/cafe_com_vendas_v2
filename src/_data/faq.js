/**
 * FAQ Data Loader
 * Loads FAQ data from JSON file and makes it available to Eleventy templates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function() {
  try {
    const faqDataPath = path.join(__dirname, '../../info/DATA_faq.json');
    const faqData = JSON.parse(fs.readFileSync(faqDataPath, 'utf8'));

    // Add computed properties for easier template usage
    faqData.items.forEach((item, index) => {
      item.number = index + 1;
      item.unique_id = `faq-${item.number}`;
      item.answer_id = `faq-answer-${item.number}`;
      item.icon_id = `faq-icon-${item.number}`;
    });

    return faqData;
  } catch (error) {
    console.error('Error loading FAQ data:', error);
    return {
      meta: {
        title: 'FAQ Error',
        description: 'Error loading FAQ data',
        section_title: 'Perguntas Frequentes',
        section_subtitle: 'Error loading FAQ data'
      },
      items: []
    };
  }
};