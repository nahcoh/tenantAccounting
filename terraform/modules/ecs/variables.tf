variable "project_name" {
  description = "Project name to be used as a prefix for resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "frontend_image" {
  description = "Docker image URL for frontend"
  type        = string
}

variable "backend_image" {
  description = "Docker image URL for backend"
  type        = string
}

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

variable "frontend_target_group_arn" {
  description = "Target group ARN for frontend load balancer"
  type        = string
}

variable "backend_target_group_arn" {
  description = "Target group ARN for backend load balancer"
  type        = string
}

variable "alb_listener_arn" {
  description = "ALB listener ARN (for dependency)"
  type        = string
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
