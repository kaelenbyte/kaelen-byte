export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ReportTargetType = 'post' | 'comment' | 'profile'
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned'
export type NotificationType = 'like' | 'comment' | 'follow' | 'moderation'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string
          avatar_url: string | null
          header_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string
          avatar_url?: string | null
          header_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string
          bio?: string
          avatar_url?: string | null
          header_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          user_id?: string
          created_at?: string
        }
        Update: {
          created_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id?: string
          following_id: string
          created_at?: string
        }
        Update: {
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: ReportTargetType
          target_id: string
          reason: string
          details: string | null
          status: ReportStatus
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          reporter_id?: string
          target_type: ReportTargetType
          target_id: string
          reason: string
          details?: string | null
          status?: ReportStatus
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          status?: ReportStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string | null
          type: NotificationType
          entity_type: string | null
          entity_id: string | null
          message: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          actor_id?: string | null
          type: NotificationType
          entity_type?: string | null
          entity_id?: string | null
          message?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          user_id?: string
          post_id: string
          created_at?: string
        }
        Update: {
          created_at?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          created_at?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          id: string
          moderator_id: string | null
          target_type: ReportTargetType
          target_id: string
          action: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          moderator_id?: string
          target_type: ReportTargetType
          target_id: string
          action: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          action?: string
          reason?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role: string
          granted_at: string
        }
        Insert: {
          user_id: string
          role: string
          granted_at?: string
        }
        Update: {
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      post_details: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
          like_count: number
          comment_count: number
        }
        Relationships: []
      }
      profile_stats: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string
          avatar_url: string | null
          header_image_url: string | null
          created_at: string
          post_count: number
          follower_count: number
          following_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_moderator: {
        Args: Record<string, never>
        Returns: boolean
      }
      enforce_post_rate_limit: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      report_target_type: ReportTargetType
      report_status: ReportStatus
      notification_type: NotificationType
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type Comment = Tables<'comments'>
export type Like = Tables<'likes'>
export type Follow = Tables<'follows'>
export type Report = Tables<'reports'>
export type Notification = Tables<'notifications'>
export type SavedPost = Tables<'saved_posts'>
export type ModerationAction = Tables<'moderation_actions'>
export type PostDetails = Database['public']['Views']['post_details']['Row']
export type ProfileStats = Database['public']['Views']['profile_stats']['Row']
