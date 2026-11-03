"""
Computational grid and domain representation for ZeroG Flames.
"""
from dataclasses import dataclass
import numpy as np


@dataclass
class SimulationGrid:
    nx: int = 64
    ny: int = 64
    lx: float = 0.08  # 8 cm domain width
    ly: float = 0.08  # 8 cm domain height
    
    def __post_init__(self):
        self.dx = self.lx / (self.nx - 1)
        self.dy = self.ly / (self.ny - 1)
        self.x = np.linspace(0, self.lx, self.nx)
        self.y = np.linspace(0, self.ly, self.ny)
        self.xx, self.yy = np.meshgrid(self.x, self.y)
        
        # Burner / Fuel inlet location (bottom-center)
        self.burner_ix = self.nx // 2
        self.burner_iy = max(2, self.ny // 10)  # Near bottom
        self.burner_radius_cells = max(1, self.nx // 24)
        
        # Precompute distance from burner center
        self.dist_from_burner = np.sqrt(
            (self.xx - self.x[self.burner_ix]) ** 2 + 
            (self.yy - self.y[self.burner_iy]) ** 2
        )
        self.burner_mask = self.dist_from_burner <= (self.burner_radius_cells * self.dx)
