variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name to be used as a prefix for resources"
  type        = string
  default     = "starter"
}

# VPC Variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ECS Variables
variable "frontend_cpu" {
  description = "CPU units for frontend task (256 = 0.25 vCPU)"
  type        = string
  default     = "256"
}

variable "frontend_memory" {
  description = "Memory for frontend task in MB"
  type        = string
  default     = "512"
}

variable "backend_cpu" {
  description = "CPU units for backend task (512 = 0.5 vCPU)"
  type        = string
  default     = "512"
}

variable "backend_memory" {
  description = "Memory for backend task in MB"
  type        = string
  default     = "1024"
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "frontend_environment" {
  description = "Environment variables for frontend container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "backend_environment" {
  description = "Environment variables for backend container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

# RDS Variables
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "starter"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.14"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying (for dev/test only)"
  type        = bool
  default     = false
}
