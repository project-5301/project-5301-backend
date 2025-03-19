//src/utils/email-template.js
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');

/**
 * Converts an MJML template to HTML with variable replacement
 * @param {string} templateName - Name of the template file without extension
 * @param {Object} data - Object containing variables to replace in the template
 * @returns {Object} The processed HTML output
 */
const mjml2html = (templateName, data) => {
  try {
    // Construct the path to the template file
    const templatePath = path.join(__dirname, '..', 'email-templates', `${templateName}.mjml`);
    
    // Read the template file
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in the template
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      templateContent = templateContent.replace(regex, data[key] || '');
    });
    
    // Process MJML to HTML
    const htmlOutput = mjml(templateContent);
    
    if (htmlOutput.errors && htmlOutput.errors.length) {
      console.error('MJML processing errors:', htmlOutput.errors);
    }
    
    return htmlOutput;
  } catch (error) {
    console.error('Error processing MJML template:', error);
    // Return a simple fallback HTML if template processing fails
    return { 
      html: `<p>Email content unavailable. Please contact support.</p>` 
    };
  }
};

module.exports = {
  mjml2html
};