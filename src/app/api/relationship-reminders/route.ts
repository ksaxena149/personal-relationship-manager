import { NextRequest } from 'next/server';
import { prisma } from '@/utils/db/prisma';
import { AuthRequest, authMiddleware } from '@/utils/auth/middleware';
import {
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '@/utils/api/response';
import { relationshipTypes, getRandomInteractionVerb } from '@/utils/relationshipConfig';

// POST handler to generate relationship-based reminders
export async function POST(req: AuthRequest) {
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse;

  try {
    const userId = req.user!.id;
    
    // Find all contacts with relationship types set
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        OR: [
          { relationshipType: { not: null } },
          { customInteractionDays: { not: null } }
        ]
      }
    });

    const today = new Date();
    const createdReminders = [];

    // For each contact, check if we need to create a reminder
    for (const contact of contacts) {
      // Skip if no last interaction date
      if (!contact.lastInteractionDate) continue;
      
      // Determine recommended interaction days
      let recommendedDays = 0;
      
      if (contact.customInteractionDays && contact.customInteractionDays > 0) {
        // Use custom interaction days if set
        recommendedDays = contact.customInteractionDays;
      } else if (contact.relationshipType) {
        // Look up recommended days from relationship type
        const relationshipType = relationshipTypes.find(type => type.id === contact.relationshipType);
        if (relationshipType) {
          recommendedDays = relationshipType.recommendedInteractionDays;
        }
      }
      
      // Skip if no recommendation
      if (recommendedDays <= 0) continue;
      
      // Calculate days since last interaction
      const lastInteraction = new Date(contact.lastInteractionDate);
      const daysSinceInteraction = Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we've passed the recommended interaction period
      if (daysSinceInteraction >= recommendedDays) {
        // Check if there's already an active reminder for this contact
        const existingReminder = await prisma.reminder.findFirst({
          where: {
            userId,
            contactId: contact.id,
            isCompleted: false,
            description: {
              contains: 'interaction'
            }
          }
        });
        
        // Only create a new reminder if there isn't one already
        if (!existingReminder) {
          const verb = getRandomInteractionVerb('future');
          const relationshipLabel = contact.relationshipType 
            ? relationshipTypes.find(type => type.id === contact.relationshipType)?.label || 'contact'
            : 'contact';
            
          const reminder = await prisma.reminder.create({
            data: {
              userId,
              contactId: contact.id,
              reminderDate: today,
              description: `Time to ${verb} ${contact.firstName}! (${daysSinceInteraction} days since last interaction with this ${relationshipLabel.toLowerCase()})`,
              isRecurring: false,
              isCompleted: false,
            }
          });
          
          createdReminders.push(reminder);
        }
      }
    }

    return successResponse(createdReminders, `Generated ${createdReminders.length} relationship reminders`);
  } catch (error) {
    console.error('Error generating relationship reminders:', error);
    return serverErrorResponse('Error generating relationship reminders');
  }
} 