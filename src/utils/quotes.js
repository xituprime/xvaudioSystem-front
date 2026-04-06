export function getQuoteOfferMessage(quote) {
  if (!quote) return '';
  return String(
    quote.offerMessage ??
      quote.offer_message ??
      quote.proposalMessage ??
      quote.proposal_message ??
      quote.adminOffer ??
      ''
  ).trim();
}

/** Texto que el cliente escribió al crear la cotización (nombres según backend). */
export function getQuoteClientRequestMessage(quote) {
  if (!quote) return '';
  const raw =
    quote.message ??
    quote.clientMessage ??
    quote.client_message ??
    quote.requestMessage ??
    quote.request_message ??
    quote.customerMessage ??
    quote.customer_message ??
    quote.clientNotes ??
    quote.client_notes ??
    quote.userMessage ??
    quote.user_message ??
    quote.observations ??
    quote.observaciones ??
    quote.note ??
    quote.details?.message ??
    quote.details?.clientMessage ??
    '';
  return String(raw).trim();
}
