// Email templates for customer onboarding and success

export const emailTemplates = {
  welcome: {
    subject: "Welcome to SmartingGoods! Let's Build Your Dream Website 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SmartingGoods!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your professional website is just minutes away</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{customerName}},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing SmartingGoods! We're excited to help you create a stunning website that will grow your business and impress your customers.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Step 1:</strong> Choose your template (2 minutes)</li>
              <li><strong>Step 2:</strong> Add your business information (5 minutes)</li>
              <li><strong>Step 3:</strong> Customize your design (3 minutes)</li>
              <li><strong>Step 4:</strong> Launch your website (instant!)</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{builderUrl}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Building Your Website
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Need help? Reply to this email or schedule a free 15-minute consultation with our team. We're here to ensure your success!
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              Best regards,<br>
              The SmartingGoods Team<br>
              <a href="mailto:support@smartinggoods.com">support@smartinggoods.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  },

  dayThreeCheckIn: {
    subject: "How's your website coming along? Need any help? 🤝",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{customerName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            It's been 3 days since you joined SmartingGoods, and I wanted to personally check in to see how your website is coming along.
          </p>
          
          {{#if websiteCreated}}
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;">
              🎉 Congratulations! I see you've created your website. That's awesome!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Here are some quick tips to make your website even better:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Add high-quality photos of your work or products</li>
            <li>Include customer testimonials and reviews</li>
            <li>Make sure your contact information is prominent</li>
            <li>Test your website on mobile devices</li>
          </ul>
          {{else}}
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              I noticed you haven't created your website yet. No worries - let's get you started!
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Many of our customers find it helpful to:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Start with a template that matches your business type</li>
            <li>Have your business information ready (address, phone, hours)</li>
            <li>Gather 3-5 high-quality photos of your work</li>
            <li>Set aside 15 minutes of uninterrupted time</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{builderUrl}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Create Your Website Now
            </a>
          </div>
          {{/if}}
          
          <p style="color: #666; line-height: 1.6;">
            Remember, I'm here to help! If you have any questions or need assistance, just reply to this email or book a free consultation call.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{consultationUrl}}" style="background: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Book Free Consultation
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Cheers,<br>
            Sarah Johnson<br>
            Customer Success Manager<br>
            SmartingGoods
          </p>
        </div>
      </div>
    `
  },

  weekOneSuccess: {
    subject: "🎉 Your website is live! Here's how to get more customers",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your website is live and looking amazing</p>
        </div>
        
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{customerName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your website is now live at <a href="{{websiteUrl}}" style="color: #3B82F6;">{{websiteUrl}}</a> and it looks fantastic! 
            You should be proud of what you've created.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Now let's get you more customers! 📈</h3>
            
            <h4 style="color: #333; margin-bottom: 10px;">1. Share Your Website</h4>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Add the link to your email signature</li>
              <li>Share on your social media profiles</li>
              <li>Include it on your business cards</li>
              <li>Add it to your Google My Business listing</li>
            </ul>
            
            <h4 style="color: #333; margin-bottom: 10px;">2. Optimize for Search Engines</h4>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Add your location to page titles</li>
              <li>Include relevant keywords in your content</li>
              <li>Encourage customer reviews</li>
              <li>Submit your sitemap to Google</li>
            </ul>
            
            <h4 style="color: #333; margin-bottom: 10px;">3. Track Your Success</h4>
            <ul style="color: #666; line-height: 1.6;">
              <li>Monitor your website analytics</li>
              <li>Track phone calls and emails</li>
              <li>Ask customers how they found you</li>
              <li>Celebrate your wins!</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Your Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            I'm excited to see your business grow! If you need any help or have questions, I'm just an email away.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Cheers to your success!<br>
            Sarah Johnson<br>
            Customer Success Manager
          </p>
        </div>
      </div>
    `
  },

  monthlyCheckIn: {
    subject: "Your website stats are in! Plus tips to grow even more 📊",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{customerName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            It's been a month since your website went live, and I wanted to share some exciting stats with you!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Website Performance 📊</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">{{pageViews}}</div>
                <div style="color: #666; font-size: 14px;">Page Views</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{visitors}}</div>
                <div style="color: #666; font-size: 14px;">Unique Visitors</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 24px; font-weight: bold; color: #ffc107;">{{contactForms}}</div>
                <div style="color: #666; font-size: 14px;">Contact Forms</div>
              </div>
            </div>
          </div>
          
          {{#if performanceGood}}
          <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #155724; margin: 0;">
              🎉 Great job! Your website is performing well and attracting visitors.
            </p>
          </div>
          {{else}}
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              💡 Let's work together to get more people to discover your website!
            </p>
          </div>
          {{/if}}
          
          <h3 style="color: #333;">Tips to Boost Your Results 🚀</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li><strong>Add fresh content:</strong> Update your services or add a blog post</li>
            <li><strong>Encourage reviews:</strong> Ask happy customers to leave Google reviews</li>
            <li><strong>Social media:</strong> Share your website link regularly</li>
            <li><strong>Local SEO:</strong> Make sure your address and hours are accurate</li>
            <li><strong>Mobile check:</strong> Test your site on different devices</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Full Analytics
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Keep up the great work! Your success is our success, and I'm here to help you every step of the way.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            Sarah Johnson<br>
            Customer Success Manager
          </p>
        </div>
      </div>
    `
  },

  paymentFailed: {
    subject: "Action Required: Update Your Payment Method 💳",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{customerName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We tried to process your payment for SmartingGoods, but it didn't go through. This can happen for various reasons - expired card, insufficient funds, or bank security measures.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              <strong>Don't worry!</strong> Your website is still active, and you have 7 days to update your payment method.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            To keep your website running smoothly, please update your payment information:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{billingUrl}}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Update Payment Method
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you're experiencing financial difficulties or have questions about your subscription, please don't hesitate to reach out. We're here to help and can work with you to find a solution.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for being a valued SmartingGoods customer!
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The SmartingGoods Team<br>
            <a href="mailto:billing@smartinggoods.com">billing@smartinggoods.com</a>
          </p>
        </div>
      </div>
    `
  }
}

export function renderEmailTemplate(templateName: keyof typeof emailTemplates, variables: Record<string, any>): { subject: string; html: string } {
  const template = emailTemplates[templateName]
  let { subject, html } = template
  
  // Simple template variable replacement
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, String(value))
    html = html.replace(regex, String(value))
  })
  
  // Handle conditional blocks (simplified)
  html = html.replace(/{{#if (\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, condition, ifBlock, elseBlock) => {
    return variables[condition] ? ifBlock : elseBlock
  })
  
  html = html.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, ifBlock) => {
    return variables[condition] ? ifBlock : ''
  })
  
  return { subject, html }
}