export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      championships: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          level: Database["public"]["Enums"]["competition_level"]
          location: string | null
          name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          level: Database["public"]["Enums"]["competition_level"]
          location?: string | null
          name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          level?: Database["public"]["Enums"]["competition_level"]
          location?: string | null
          name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      circulars: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          sender_name: string
          sender_role: string
          target_level: Database["public"]["Enums"]["competition_level"]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          sender_name: string
          sender_role?: string
          target_level?: Database["public"]["Enums"]["competition_level"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          sender_name?: string
          sender_role?: string
          target_level?: Database["public"]["Enums"]["competition_level"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          category: Database["public"]["Enums"]["game_category"]
          championship_id: string | null
          created_at: string
          description: string | null
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_timed: boolean
          level: Database["public"]["Enums"]["competition_level"]
          max_qualifiers: number | null
          name: string
          race_type: string | null
          school_level: Database["public"]["Enums"]["school_level"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["game_category"]
          championship_id?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_timed?: boolean
          level: Database["public"]["Enums"]["competition_level"]
          max_qualifiers?: number | null
          name: string
          race_type?: string | null
          school_level?: Database["public"]["Enums"]["school_level"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["game_category"]
          championship_id?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_timed?: boolean
          level?: Database["public"]["Enums"]["competition_level"]
          max_qualifiers?: number | null
          name?: string
          race_type?: string | null
          school_level?: Database["public"]["Enums"]["school_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      heat_participants: {
        Row: {
          created_at: string
          heat_id: string
          id: string
          is_qualified_for_final: boolean
          participant_id: string
          position: number | null
          time_taken: number | null
        }
        Insert: {
          created_at?: string
          heat_id: string
          id?: string
          is_qualified_for_final?: boolean
          participant_id: string
          position?: number | null
          time_taken?: number | null
        }
        Update: {
          created_at?: string
          heat_id?: string
          id?: string
          is_qualified_for_final?: boolean
          participant_id?: string
          position?: number | null
          time_taken?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "heat_participants_heat_id_fkey"
            columns: ["heat_id"]
            isOneToOne: false
            referencedRelation: "heats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heat_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      heats: {
        Row: {
          created_at: string
          game_id: string
          heat_number: number
          heat_type: string
          id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          heat_number: number
          heat_type?: string
          id?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          heat_number?: number
          heat_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      match_pools: {
        Row: {
          created_at: string
          game_id: string
          id: string
          notes: string | null
          round_name: string
          team_a_school_id: string | null
          team_a_score: number | null
          team_b_school_id: string | null
          team_b_score: number | null
          updated_at: string
          winner_school_id: string | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          notes?: string | null
          round_name?: string
          team_a_school_id?: string | null
          team_a_score?: number | null
          team_b_school_id?: string | null
          team_b_score?: number | null
          updated_at?: string
          winner_school_id?: string | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          notes?: string | null
          round_name?: string
          team_a_school_id?: string | null
          team_a_score?: number | null
          team_b_school_id?: string | null
          team_b_score?: number | null
          updated_at?: string
          winner_school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_pools_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_pools_team_a_school_id_fkey"
            columns: ["team_a_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_pools_team_b_school_id_fkey"
            columns: ["team_b_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_pools_winner_school_id_fkey"
            columns: ["winner_school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          created_at: string
          first_name: string
          game_id: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          is_qualified: boolean
          last_name: string
          notes: string | null
          position: number | null
          school_id: string
          score: number | null
          time_taken: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          game_id: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_qualified?: boolean
          last_name: string
          notes?: string | null
          position?: number | null
          school_id: string
          score?: number | null
          time_taken?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          game_id?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          is_qualified?: boolean
          last_name?: string
          notes?: string | null
          position?: number | null
          school_id?: string
          score?: number | null
          time_taken?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          country: string
          county: string
          created_at: string
          id: string
          name: string
          region: string
          subcounty: string
          updated_at: string
          zone: string
        }
        Insert: {
          country?: string
          county: string
          created_at?: string
          id?: string
          name: string
          region: string
          subcounty: string
          updated_at?: string
          zone: string
        }
        Update: {
          country?: string
          county?: string
          created_at?: string
          id?: string
          name?: string
          region?: string
          subcounty?: string
          updated_at?: string
          zone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      competition_level: "zone" | "subcounty" | "county" | "region" | "national"
      game_category: "ball_games" | "athletics" | "music" | "other"
      gender: "boys" | "girls"
      school_level: "primary" | "junior_secondary"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      competition_level: ["zone", "subcounty", "county", "region", "national"],
      game_category: ["ball_games", "athletics", "music", "other"],
      gender: ["boys", "girls"],
      school_level: ["primary", "junior_secondary"],
    },
  },
} as const
