import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../content/pt-PT/site.json'), 'utf8')
);

export default {
  ...siteData,
  url: process.env.URL || siteData.url,
  analytics: {
    gtmId: process.env.VITE_GTM_CONTAINER_ID || siteData.analytics.gtmId
  },
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || siteData.cloudinaryCloudName
};