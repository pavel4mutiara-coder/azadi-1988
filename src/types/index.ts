export type Language = 'en' | 'bn';

export enum DonationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AdminRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'editor';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateDonorInfo {
  donorName?: string;
  phone?: string;
  email?: string;
  address?: string;
  transactionId?: string;
  paymentReference?: string;
  privateNotes?: string;
  updatedAt?: string;
}

export interface PublicDonationStats {
  totalAmount?: number;
  totalDonations?: number;
  totalApprovedAmount: number;
  totalApprovedDonations: number;
  monthlyAmount?: number;
  monthlyDonations?: number;
  lastUpdated: string;
  updatedAt?: string;
}

export interface Donation {
  id: string;
  name?: string;
  donorName: string;
  isAnonymous: boolean;
  anonymous?: boolean;
  amount: number;
  currency?: string;
  phone?: string;
  email?: string;
  address?: string;
  transactionId?: string;
  paymentReference?: string;
  privateNotes?: string;
  purpose: string;
  status: DonationStatus;
  approved?: boolean;
  date: string;
  paymentMethod: string;
  method?: string;
  receiptId?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Leadership {
  id: string;
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  subDesignationEn?: string;
  subDesignationBn?: string;
  category?: 'leader' | 'executive' | 'advisor' | 'volunteer' | 'member' | string;
  image: string; // URL string
  phone: string;
  email?: string;
  bioEn?: string;
  bioBn?: string;
  quoteEn?: string;
  quoteBn?: string;
  messageEn: string;
  messageBn: string;
  order: number;
  sortOrder?: number;
  active?: boolean;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  locationEn: string;
  locationBn: string;
  date: string;
  image: string; // HTTPS URL
  status?: string;
  time?: string;
  meetUrl?: string; // Optional Google Meet URL
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notice {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  date: string;
  priority?: 'normal' | 'high' | 'urgent' | string;
  isUrgent?: boolean;
  published?: boolean;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface News {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  date: string;
  image: string; // URL string
  author?: string;
  published?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationSettings {
  nameBn: string;
  nameEn: string;
  organizationNameBn?: string;
  organizationNameEn?: string;
  sloganBn: string;
  sloganEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  email: string;
  establishedBn: string;
  establishedEn: string;
  logo: string;
  flag: string;
  logoUrl?: string;
  faviconUrl?: string;
  website?: string;
  primaryColor?: string;
  secondaryColor?: string;
  adminWhatsApp: string;
  whatsapp?: string;
  bkash: string;
  nagad: string;
  roket: string;
  facebook: string;
  youtube: string;
  whatsappChannel: string;
  googleChatSpace?: string;
  googleChatEnabled?: boolean;
  googleChatNotifyOnReceipt?: boolean;
  googleChatNotifyOnApproval?: boolean;
  googleChatNotifyOnExpense?: boolean;
  updatedAt?: string;
}

export interface LetterheadConfig {
  leaderName: string;
  designation: string;
  signature: string;
  stampText: string;
  bodyText: string; // Document content
  organizationNameBn?: string;
  organizationNameEn?: string;
  addressBn?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  signatureUrl?: string;
  footerBn?: string;
  footerEn?: string;
  signatureWidth?: number;
  signatureYOffset?: number;
  signatureXOffset?: number;
  signatureRotation?: number;
  signatureOpacity?: number;
  qrEnabled?: boolean;
  qrSize?: number;
  qrPosition?: 'bottom-left' | 'top-right' | 'bottom-right' | 'footer-center';
  qrCustomText?: string;
  qrXOffset?: number;
  qrYOffset?: number;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name?: string;
  nameEn: string;
  nameBn?: string;
  designation?: string;
  roleEn?: string;
  roleBn?: string;
  locationEn?: string;
  locationBn?: string;
  quoteEn: string;
  quoteBn?: string;
  messageEn?: string;
  messageBn?: string;
  image: string; // URL string
  rating?: number;
  approved?: boolean;
  status: 'PENDING' | 'APPROVED';
  createdAt: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  title?: string;
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  descriptionEn: string;
  descriptionBn: string;
  date: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionSyncState {
  collectionName: string;
  firestoreLastUpdated: string | null;
  localLastUpdated: string | null;
  status: 'synced' | 'stale' | 'offline' | 'unknown';
  metadataSource: 'server' | 'cache' | 'mock';
  count: number;
  fromCache?: boolean;
  hasPendingWrites?: boolean;
  error?: string | null;
}

export interface VersionConfig {
  latestVersion: string;
  version?: string;
  buildNumber: number;
  build?: number;
  releaseDate: string;
  releaseNotes: string;
  forceUpdate: boolean;
  apkDownloadUrl?: string;
  updateSize?: string;
  playStoreUrl?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  collection?: string;
  targetCollection?: string;
  documentId?: string;
  targetDocId?: string;
  userId: string;
  userEmail: string;
  timestamp?: string;
  createdAt?: string;
  details?: string;
}
