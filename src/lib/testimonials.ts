/**
 * Real customer testimonials only - never fabricate quotes for marketing pages.
 *
 * Each entry must include:
 * - venueName
 * - personName
 * - role
 * - quote
 * - permissionConfirmed: true (written approval on file)
 *
 * Do not display testimonial cards unless permissionConfirmed is true.
 */
export type Testimonial = {
  venueName: string;
  personName: string;
  role: string;
  quote: string;
  permissionConfirmed: boolean;
  logoUrl?: string;
  imageUrl?: string;
};

export const testimonials: Testimonial[] = [];

export function getApprovedTestimonials(): Testimonial[] {
  return testimonials.filter((t) => t.permissionConfirmed);
}
